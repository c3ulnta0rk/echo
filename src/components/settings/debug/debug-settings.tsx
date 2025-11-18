import React from "react";
import { WordCorrectionThreshold } from "./word-correction-threshold";
import { SettingsGroup } from "../../ui/SettingsGroup";
import { LogDirectory, LogLevelSelector } from "./index";
import { HistoryLimit } from "../history-limit";
import { AlwaysOnMicrophone } from "../always-on-microphone";
import { SoundPicker } from "../sound-picker";
import { MuteWhileRecording } from "../mute-while-recording";
import { RecordingRetentionPeriodSelector } from "../recording-retention-period";
import { ClamshellMicrophoneSelector } from "../clamshell-microphone-selector";

export const DebugSettings = () => {
  return (
    <div className="max-w-3xl w-full mx-auto space-y-6">
      <SettingsGroup title="Debug">
        <SoundPicker
          label="Sound Theme"
          description="Choose a sound theme for recording start and stop feedback"
        />
        <WordCorrectionThreshold descriptionMode="tooltip" grouped={true} />
        <HistoryLimit descriptionMode="tooltip" grouped={true} />
        <RecordingRetentionPeriodSelector descriptionMode="tooltip" grouped={true} />
        <AlwaysOnMicrophone descriptionMode="tooltip" grouped={true} />
        <ClamshellMicrophoneSelector descriptionMode="tooltip" grouped={true} />
        <LogDirectory descriptionMode="tooltip" grouped={true} />
        <LogLevelSelector descriptionMode="tooltip" grouped={true} />
        <MuteWhileRecording descriptionMode="tooltip" grouped={true} />
      </SettingsGroup>
    </div>
  );
};
