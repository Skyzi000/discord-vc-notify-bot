import { Channel, Client, Intents, TextBasedChannels, User, VoiceState } from "discord.js";

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
if (process.env.DISCORD_BOT_OWNER_ID === undefined)
    throw new Error("DISCORD_BOT_OWNER_ID is undefined");

const ownerId = process.env.DISCORD_BOT_OWNER_ID;
let owner: User;
let notifyChannel: TextBasedChannels | undefined;

client.once("ready", async () => {
    owner = await client.users.fetch(ownerId);
    console.log(`${client.user?.username} is ready!`);
});

client.on("voiceStateUpdate", async (os, ns) => onVoiceStateUpdate(os, ns));

client.on("message", async message => {
    if (message.author.bot) {
        return;
    }
    if (client.user !== null && message.mentions.users.has(client.user.id)) {
        const cmds = message.content.split(" ").slice(1);
        console.log(`Commands: ${cmds.join(", ")}`);
        switch (cmds[0]) {
            case "setnc":
            case "set_notification_channel":
            case "通知チャンネル":
                notifyChannel = message.channel;
                await message.reply("ここを通知チャンネルに設定しました。");
                break;

            default:
                await message.reply("呼んだ～？");
                break;
        }
    }
});



client.login(process.env.DISCORD_BOT_TOKEN);

async function onVoiceStateUpdate(oldState: VoiceState, newState: VoiceState) {
    if (oldState.channelId !== newState.channelId) {
        if (newState.channelId !== null && newState.channel?.members.size === 1) {
            const username = newState.member?.displayName;
            if (notifyChannel === undefined) {
                owner.send("通知するチャンネルを`setnc`コマンドで設定してください。");
                return;
            }
            await notifyChannel.send(`${username} さんが <#${newState.channelId}> で通話を開始しました。`);
        }
    }
}
