import { Client, Intents, TextBasedChannels, VoiceState } from "discord.js";
import { existsSync, readFileSync } from "fs";
import Keyv from 'keyv';

let discordBotToken: string;

if (process.env.NODE_ENV === "production") {
    const tokenFile = process.env.DISCORD_BOT_TOKEN_FILE;
    if (tokenFile === undefined || !existsSync(tokenFile)) {
        if (process.env.DISCORD_BOT_TOKEN === undefined) {
            console.error("'DISCORD_BOT_TOKEN'を設定してください。")
            process.exit(1);
        }
        else {
            discordBotToken = process.env.DISCORD_BOT_TOKEN;
            console.warn(
                "環境変数'DISCORD_BOT_TOKEN'ではなく、secretsの利用をお勧めします。\n" +
                "参考: https://docs.docker.com/compose/compose-file/compose-file-v3/#secrets")
        }
    }
    else {
        discordBotToken = readFileSync(tokenFile, "utf-8").trim();
    }
}
else {
    // .envファイルから環境変数の読み込み
    require("dotenv").config();
    if (process.env.DISCORD_BOT_TOKEN === undefined) {
        console.error("'DISCORD_BOT_TOKEN'を設定してください。")
        process.exit(1);
    }
    discordBotToken = process.env.DISCORD_BOT_TOKEN;
}

const notifyChannels = new Keyv("sqlite://data/db.sqlite", { table: "notifyChannel" });

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
    if (message.author.bot || message.guildId == null || client.user == null || !(message.channel.type === "GUILD_TEXT" || message.channel.type === "GUILD_NEWS")) {
        return;
    }
    if (message.mentions.users.has(client.user.id)) {
        const cmds = message.content.split(" ").slice(1).filter((value) => value.trim() !== "");
        console.log(`Commands: ${cmds.join(", ")}`);
        switch (cmds[0]?.trim()) {
            case "setnc":
            case "set_notification_channel":
            case "通知チャンネル":
                if (cmds.length == 1) {
                    const key = `${message.guildId} ${message.channel.parentId}`;
                    setNotifyChannel(key, message.channel);
                    await message.reply(`<#${message.channelId}> を <#${message.channel.parentId}> カテゴリの通知チャンネルに設定しました。`);
                }
                else {
                    let nc;
                    try {
                        nc = await client.channels.fetch(cmds[1].replace(/[<#> 　]/g, ""));
                    } catch (DiscordAPIError) {
                        await message.reply("チャンネルIDが正しくありません");
                        break;
                    }
                    if (nc != null && nc.isText()) {
                        const key = `${message.guildId} ${message.channel.parentId}`;
                        setNotifyChannel(key, nc);
                        await message.reply(`<#${nc.id}> を <#${message.channel.parentId}> カテゴリの通知チャンネルに設定しました。`);
                    }
                    else {
                        await message.reply("チャンネルIDが正しくありません");
                    }
                }
                break;
            case "delnc":
            case "rmnc":
            case "delete_notification_channel":
            case "remove_notification_channel":
                const key = `${message.guildId} ${message.channel.parentId}`;
                delNotifyChannel(key);
                await message.reply(`<#${message.channel.parentId}> カテゴリの通知設定を削除しました。`);
                break;

            default:
                await message.reply("呼んだ～？");
                break;
        }
    }
});

async function onVoiceStateUpdate(oldState: VoiceState, newState: VoiceState) {
    if (oldState.channel !== null || newState.channel === null || oldState.channelId == newState.channelId) {
        return;
    }
    if (newState.member !== null && newState.channel.members.size === 1) {
        const key = `${newState.guild.id} ${newState.channel.parentId}`
        const notifyChannel = await getNotifyChannel(key);
        if (notifyChannel === undefined) {
            // newState.member.send("通話開始を通知するチャンネルが設定されていません。\n`setnc`コマンドを使って設定してください。");
            return;
        }
        await notifyChannel.send(`<@${newState.member.id}> さんが <#${newState.channelId}> で通話を開始しました。`);
    }
}

async function setNotifyChannel(key: string, channel: TextBasedChannels) {
    await notifyChannels.set(key, channel.id);
}

async function getNotifyChannel(key: string): Promise<TextBasedChannels | undefined> {
    const id = await notifyChannels.get(key);
    if (!id) {
        return undefined;
    }
    const ch = await client.channels.fetch(id);
    if (ch?.isText()) {
        return ch;
    }
    return undefined;
}

async function delNotifyChannel(key: string) {
    await notifyChannels.delete(key);
}

client.login(discordBotToken);
