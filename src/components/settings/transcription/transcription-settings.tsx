import { CollapsibleSettingsGroup } from "@/components/ui/CollapsibleSettingsGroup";
import { CustomWords } from "../custom-words";
import { LanguageSelector } from "../language-selector";
import { ModelUnloadTimeoutSetting } from "../model-unload-timeout";
import { TranslateToEnglish } from "../translate-to-english";

export const TranscriptionSettings = () => (
  <div className="mx-auto w-full max-w-3xl pb-20">
    <CollapsibleSettingsGroup defaultOpen={true} title="Language">
      <LanguageSelector descriptionMode="tooltip" grouped={true} />
      <TranslateToEnglish descriptionMode="tooltip" grouped={true} />
    </CollapsibleSettingsGroup>

    <CollapsibleSettingsGroup defaultOpen={true} title="Accuracy">
      <CustomWords descriptionMode="tooltip" grouped={true} />
      <ModelUnloadTimeoutSetting descriptionMode="tooltip" grouped={true} />
    </CollapsibleSettingsGroup>
  </div>
);
