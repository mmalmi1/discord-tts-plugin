import {createPlugin, Logger, Patcher, Utils, React} from "dium";
import {
    Dispatcher,
    SelectedChannelStore,
    VoiceState,
    VoiceStateStore,
    Snowflake,
    UserStore
} from "@dium/modules";
import {MenuItem} from "@dium/components";
import {Settings} from "./settings";
import {SettingsPanel} from "./settings-panel";
import {notify} from "./voice";

interface VoiceStateUpdatesAction {
    type: "VOICE_STATE_UPDATES";
    voiceStates: VoiceState[];
}

let prevStates: Record<Snowflake, VoiceState> = {};
const saveStates = () => {
    prevStates = {...VoiceStateStore.getVoiceStatesForChannel(SelectedChannelStore.getVoiceChannelId())};
};

const voiceStateHandler = (action: VoiceStateUpdatesAction) => {
    for (const {userId, channelId} of action.voiceStates) {
        try {
            const prev = prevStates[userId];

            // User is self
            if (userId === UserStore.getCurrentUser().id) {
                return;
            }

            // User not in current channel
            const selectedChannelId = SelectedChannelStore.getVoiceChannelId();
            if (!selectedChannelId) {
                return;
            }

            if (!prev && channelId === selectedChannelId) {
                notify("join", userId, channelId);
                saveStates();
            } else if (prev && !VoiceStateStore.getVoiceStatesForChannel(selectedChannelId)[userId]) {
                notify("leave", userId, selectedChannelId);
                saveStates();
            }
        } catch (error) {
            Logger.error("Error processing voice state change, see details below");
            console.error(error);
        }
    }
};

export default createPlugin({
    start() {
        // listen for updates
        Dispatcher.subscribe("VOICE_STATE_UPDATES", voiceStateHandler);
        Logger.log("Subscribed to voice state actions");

        // patch channel context menu
        Patcher.contextMenu("channel-context", (result) => {
            const [parent, index] = Utils.queryTreeForParent(result, (child) => child?.props?.id === "hide-voice-names");
            if (parent) {
                parent.props.children.splice(index + 1, 0, (
                    <MenuItem
                        isFocused={false}
                        id="voiceevents-clear"
                        label="Clear VoiceEvents queue"
                        action={() => speechSynthesis.cancel()}
                    />
                ));
            }
        });
    },
    stop() {
        // reset
        prevStates = {};

        Dispatcher.unsubscribe("VOICE_STATE_UPDATES", voiceStateHandler);
        Logger.log("Unsubscribed from voice state actions");
    },
    Settings,
    SettingsPanel
});
