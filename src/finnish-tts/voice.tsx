import {Logger} from "dium";
import {ChannelStore, UserStore, GuildMemberStore} from "@dium/modules";
import {Settings, NotificationType} from "./settings";
import {getAudioBlob, storeAudioBlob} from "./indexedDb";

export const notify = async (type: NotificationType, userId: string, channelId: string): Promise<void> => {
    const settings = Settings.current;
    const {openaiApiKey, volume} = Settings.current;
    const notif = settings.notifs[type];

    if (!openaiApiKey) {
        Logger.error("OpenAI API key not set!");
        return;
    }

    const user = UserStore.getUser(userId);
    const channel = ChannelStore.getChannel(channelId);

    // resolve names
    const displayName = user.globalName ?? user.username;
    const nick = GuildMemberStore.getMember(channel?.getGuildId(), userId)?.nick ?? displayName;

    // Construct message to be spoken
    const message = notif.message
        .replaceAll("$user", nick);

    // Check if audio exists in cache
    let notificationAudio = await getAudioBlob(message);

    // Generate notification audio
    if (!notificationAudio) {
        const response = await fetch("https://api.openai.com/v1/audio/speech", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${openaiApiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini-tts",
                voice: "ash",
                input: message,
                instructions: "Puhu suomea.",
                response_format: "wav"
            })
        });

        if (!response.ok) {
            Logger.error("Error in audio fetch", response);
            return;
        }
        notificationAudio = await response.blob();

        storeAudioBlob(message, notificationAudio);
    }

    const notifAudioUrl = URL.createObjectURL(notificationAudio);

    const audio = new Audio(notifAudioUrl);
    audio.volume = volume / 100;
    await audio.play();
};
