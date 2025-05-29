import {React} from "dium";
import {
    Slider,
    FormTitle,
    FormItem,
    margins,
    FormDivider,
    TextInput
} from "@dium/components";
import {classNames} from "@dium/modules";
import {Settings} from "./settings";

export const SettingsPanel = (): React.JSX.Element => {
    const [
        {openaiApiKey: openaiApiKey, volume},
        _defaults,
        setSettings
    ] = Settings.useStateWithDefaults();

    return (
        <>
            <FormItem className={margins.marginBottom20}>
                <FormTitle>OpenAI API KEY</FormTitle>
                <TextInput
                    value={openaiApiKey}
                    onChange={(value: string) => {
                        setSettings({openaiApiKey: value});
                    }}
                />
            </FormItem>
            <FormDivider className={classNames(margins.marginTop20, margins.marginBottom20)}/>
            <FormItem className={margins.marginBottom20}>
                <FormTitle>Volume</FormTitle>
                <Slider
                    initialValue={volume}
                    maxValue={100}
                    minValue={0}
                    asValueChanges={(value: number) => setSettings({volume: value})}
                />
            </FormItem>
        </>
    );
};
