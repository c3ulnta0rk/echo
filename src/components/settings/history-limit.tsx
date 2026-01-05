import type React from "react";
import { useSettings } from "../../hooks/use-settings";
import { InputGroup, InputGroupInputNumber } from "../ui/input-group";
import { SettingContainer } from "../ui/SettingContainer";

interface HistoryLimitProps {
  descriptionMode?: "tooltip" | "inline";
  grouped?: boolean;
}

export const HistoryLimit: React.FC<HistoryLimitProps> = ({
  descriptionMode = "inline",
  grouped = false,
}) => {
  const { getSetting, updateSetting, isUpdating } = useSettings();

  const historyLimit = getSetting("history_limit") ?? 5;

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(event.target.value, 10);
    if (!Number.isNaN(value) && value >= 0) {
      updateSetting("history_limit", value);
    }
  };

  const handleIncrement = () => {
    if (historyLimit < 1000) {
      updateSetting("history_limit", historyLimit + 1);
    }
  };

  const handleDecrement = () => {
    if (historyLimit > 0) {
      updateSetting("history_limit", historyLimit - 1);
    }
  };

  return (
    <SettingContainer
      description="Maximum number of transcription entries to keep in history"
      descriptionMode={descriptionMode}
      grouped={grouped}
      layout="horizontal"
      title="History Limit"
    >
      <InputGroup className="w-auto">
        <InputGroupInputNumber
          className="w-16"
          disabled={isUpdating("history_limit")}
          max={1000}
          min={0}
          onChange={handleChange}
          onDecrement={handleDecrement}
          onIncrement={handleIncrement}
          suffix="entries"
          value={historyLimit}
        />
      </InputGroup>
    </SettingContainer>
  );
};
