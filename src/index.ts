import { Client, Intents, TextBasedChannels, VoiceState } from "discord.js";
import Keyv from 'keyv';

const notifyChannels = new Keyv("sqlite://data/db.sqlite", { table: "notifyChannel" });

// .envファイルから環境変数の読み込み
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const client: Client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.DIRECT_MESSAGES,
    ]
});

client.once("ready", async () => {
    if (client.user == null) {
        console.log("client.user is null!");
        return;
    }
    console.log(`${client.user.username} is ready!`);
});

client.on("voiceStateUpdate", async (os, ns) => onVoiceStateUpdate(os, ns));

client.on("message", async message => {
    if (message.author.bot || message.guildId == null || client.user == null) {
        return;
    }
    if (message.mentions.users.has(client.user.id)) {
        const cmds = message.content.split(" ").slice(1).filter((value) => value.trim() !== "");
        console.log(`Commands: ${cmds.join(", ")}`);
        switch (cmds[0].trim()) {
            case "setnc":
            case "set_notification_channel":
            case "通知チャンネル":
                if (cmds.length == 1) {
                    setNotifyChannel(message.channel, message.guildId);
                    await message.reply(`<#${message.channelId}> を通知チャンネルに設定しました。`);
                }
                else {
                    const nc = await client.channels.fetch(cmds[1].trim());
                    if (nc !== null && nc.isText()) {
                        setNotifyChannel(nc, message.guildId);
                        await message.reply(`<#${nc.id}> を通知チャンネルに設定しました。`);
                    }
                    else {
                        await message.reply("チャンネルIDが正しくありません");
                    }
                }
                break;

            default:
                await message.reply("呼んだ～？");
                break;
        }
    }
});

async function onVoiceStateUpdate(oldState: VoiceState, newState: VoiceState) {
    if (oldState.channelId !== newState.channelId) {
        if (newState.channelId !== null && newState.channel?.members.size === 1) {
            const notifyChannel = await getNotifyChannel(newState.guild.id);
            if (notifyChannel === undefined) {
                newState.member?.send("通話開始を通知するチャンネルが設定されていません。\n`setnc`コマンドを使って設定してください。");
                return;
            }
            const username = newState.member?.displayName;
            await notifyChannel.send(`${username} さんが <#${newState.channelId}> で通話を開始しました。`);
        }
    }
}

async function setNotifyChannel(channel: TextBasedChannels, guildId: string) {
    await notifyChannels.set(guildId, channel.id);
}

async function getNotifyChannel(guildId: string): Promise<TextBasedChannels | undefined> {
    const id = await notifyChannels.get(guildId);
    if (!id) {
        return undefined;
    }
    const ch = await client.channels.fetch(id);
    if (ch?.isText()) {
        return ch;
    }
    return undefined;
}

client.login(process.env.DISCORD_BOT_TOKEN);
