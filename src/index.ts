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

const notifyChannelData: { [guildId: string]: Keyv } = {};

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
                    setNotifyChannel(message.guildId, message.channel.parentId, message.channel);
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
                        setNotifyChannel(message.guildId, message.channel.parentId, nc);
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
                delNotifyChannel(message.guildId, message.channel.parentId);
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
        const notifyChannel = await getNotifyChannel(newState.guild.id, newState.channel.parentId);
        if (notifyChannel === undefined) {
            // newState.member.send("通話開始を通知するチャンネルが設定されていません。\n`setnc`コマンドを使って設定してください。");
            return;
        }
        await notifyChannel.send(`<@${newState.member.id}> さんが <#${newState.channelId}> で通話を開始しました。`);
    }
}

async function setNotifyChannel(guildId: string, categoryId: string | null, channel: TextBasedChannels) {
    if (!(guildId in notifyChannelData)) {
        notifyChannelData[guildId] = new Keyv(`sqlite://data/${guildId}.sqlite`, { namespace: "notifyChannel" });
    }
    await notifyChannelData[guildId].set(categoryId ?? "null", channel.id);
}

async function getNotifyChannel(guildId: string, categoryId: string | null): Promise<TextBasedChannels | undefined> {
    if (!(guildId in notifyChannelData)) {
        notifyChannelData[guildId] = new Keyv(`sqlite://data/${guildId}.sqlite`, { namespace: "notifyChannel" });
    }
    const id = await notifyChannelData[guildId].get(categoryId ?? "null");
    if (!id) {
        return undefined;
    }
    const ch = await client.channels.fetch(id);
    if (ch?.isText()) {
        return ch;
    }
    return undefined;
}

async function delNotifyChannel(guildId: string, categoryId: string | null) {
    if (!(guildId in notifyChannelData)) {
        notifyChannelData[guildId] = new Keyv(`sqlite://data/${guildId}.sqlite`, { namespace: "notifyChannel" });
    }
    return await notifyChannelData[guildId].delete(categoryId ?? "null");
}

console.log(`
 _    ________   _   __      __  _ ____         ____        __
| |  / / ____/  / | / /___  / /_(_) __/_  __   / __ )____  / /_
| | / / /      /  |/ / __ \\/ __/ / /_/ / / /  / __  / __ \\/ __/
| |/ / /___   / /|  / /_/ / /_/ / __/ /_/ /  / /_/ / /_/ / /_
|___/\\____/  /_/ |_/\\____/\\__/_/_/  \\__, /  /_____/\\____/\\__/
                                   /____/
`);
console.log(`${process.env.npm_package_name}\nVersion ${process.env.npm_package_version}`);

client.login(discordBotToken);
