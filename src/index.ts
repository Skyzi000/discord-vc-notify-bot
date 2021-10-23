import { Client, Intents, TextBasedChannels, VoiceState } from "discord.js";

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

let notifyChannel: TextBasedChannels | undefined;

client.once("ready", async () => {
    console.log(`${client.user?.username} is ready!`);
});

client.on("voiceStateUpdate", async (os, ns) => onVoiceStateUpdate(os, ns));

client.on("message", async message => {
    if (message.author.bot) {
        return;
    }
    if (client.user !== null && message.mentions.users.has(client.user.id)) {
        const cmds = message.content.split(" ").slice(1).filter((value) => value.trim() !== "");
        console.log(`Commands: ${cmds.join(", ")}`);
        switch (cmds[0].trim()) {
            case "setnc":
            case "set_notification_channel":
            case "通知チャンネル":
                if (cmds.length == 1) {
                    notifyChannel = message.channel;
                    await message.reply(`<#${notifyChannel.id}> を通知チャンネルに設定しました。`);
                }
                else {
                    const nc = await client.channels.fetch(cmds[1].trim());
                    if (nc !== null && nc.isText()) {
                        notifyChannel = nc;
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
            if (notifyChannel === undefined) {
                newState.member?.send("通話開始を通知するチャンネルが設定されていません。\n`setnc`コマンドを使って設定してください。");
                return;
            }
            const username = newState.member?.displayName;
            await notifyChannel.send(`${username} さんが <#${newState.channelId}> で通話を開始しました。`);
        }
    }
}

client.login(process.env.DISCORD_BOT_TOKEN);
