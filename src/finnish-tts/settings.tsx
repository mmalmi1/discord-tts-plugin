import {createSettings, SettingsType} from "dium";

export const Settings = createSettings({
    openaiApiKey: null as string,
    volume: 100,
    notifs: {
        join: {
            message: "$user liittyi"
        },
        leave: {
            message: "$user poistui"
        }
    },
    unknownChannel: "Puheluun"
});

export type NotificationType = keyof SettingsType<typeof Settings>["notifs"];
