import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import type { AudioDevice, Settings } from "../lib/types";
import {
  audioDevicesAtom,
  customSoundsAtom,
  fetchPostProcessModelsAtom,
  initializeAtom,
  isLoadingAtom,
  isUpdatingAtom,
  outputDevicesAtom,
  playTestSoundAtom,
  postProcessModelOptionsAtom,
  refreshAudioDevicesAtom,
  refreshOutputDevicesAtom,
  refreshSettingsAtom,
  resetBindingAtom,
  resetSettingAtom,
  setPostProcessProviderAtom,
  settingsAtom,
  updateBindingAtom,
  updatePostProcessApiKeyAtom,
  updatePostProcessSettingAtom,
  updateSettingAtom,
} from "../stores/settings-atoms";

interface UseSettingsReturn {
  // State
  settings: Settings | null;
  isLoading: boolean;
  isUpdating: (key: string) => boolean;
  audioDevices: AudioDevice[];
  outputDevices: AudioDevice[];
  audioFeedbackEnabled: boolean;
  postProcessModelOptions: Record<string, string[]>;
  customSounds: { start: boolean; stop: boolean };

  // Actions
  updateSetting: <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => Promise<void>;
  resetSetting: (key: keyof Settings) => Promise<void>;
  refreshSettings: () => Promise<void>;
  refreshAudioDevices: () => Promise<void>;
  refreshOutputDevices: () => Promise<void>;
  playTestSound: (soundType: "start" | "stop") => Promise<void>;

  // Binding-specific actions
  updateBinding: (id: string, binding: string) => Promise<void>;
  resetBinding: (id: string) => Promise<void>;

  // Convenience getters
  getSetting: <K extends keyof Settings>(key: K) => Settings[K] | undefined;

  // Post-processing helpers
  setPostProcessProvider: (providerId: string) => Promise<void>;
  updatePostProcessBaseUrl: (
    providerId: string,
    baseUrl: string
  ) => Promise<void>;
  updatePostProcessApiKey: (
    providerId: string,
    apiKey: string
  ) => Promise<void>;
  updatePostProcessModel: (providerId: string, model: string) => Promise<void>;
  fetchPostProcessModels: (providerId: string) => Promise<string[]>;
}

export const useSettings = (): UseSettingsReturn => {
  const settings = useAtomValue(settingsAtom);
  const isLoading = useAtomValue(isLoadingAtom);
  const isUpdatingMap = useAtomValue(isUpdatingAtom);
  const audioDevices = useAtomValue(audioDevicesAtom);
  const outputDevices = useAtomValue(outputDevicesAtom);
  const postProcessModelOptions = useAtomValue(postProcessModelOptionsAtom);
  const customSounds = useAtomValue(customSoundsAtom);

  const initialize = useSetAtom(initializeAtom);
  const updateSetting = useSetAtom(updateSettingAtom);
  const resetSetting = useSetAtom(resetSettingAtom);
  const refreshSettings = useSetAtom(refreshSettingsAtom);
  const refreshAudioDevices = useSetAtom(refreshAudioDevicesAtom);
  const refreshOutputDevices = useSetAtom(refreshOutputDevicesAtom);
  const updateBinding = useSetAtom(updateBindingAtom);
  const resetBinding = useSetAtom(resetBindingAtom);
  const setPostProcessProvider = useSetAtom(setPostProcessProviderAtom);
  const updatePostProcessSetting = useSetAtom(updatePostProcessSettingAtom);
  const updatePostProcessApiKey = useSetAtom(updatePostProcessApiKeyAtom);
  const fetchPostProcessModels = useSetAtom(fetchPostProcessModelsAtom);
  const playTestSound = useSetAtom(playTestSoundAtom);

  // Initialize on first mount
  useEffect(() => {
    // We only want to initialize if we haven't loaded settings yet
    // But since atoms are global, we might want to check if settings are null
    if (isLoading && !settings) {
      initialize();
    }
  }, [initialize, isLoading, settings]);

  return {
    settings,
    isLoading,
    isUpdating: (key: string) => isUpdatingMap[key],
    audioDevices,
    outputDevices,
    audioFeedbackEnabled: settings?.audio_feedback ?? false,
    postProcessModelOptions,
    customSounds,
    updateSetting: (key, value) => updateSetting(key, value),
    resetSetting: (key) => resetSetting(key),
    refreshSettings: () => refreshSettings(),
    refreshAudioDevices: () => refreshAudioDevices(),
    refreshOutputDevices: () => refreshOutputDevices(),
    playTestSound: (soundType) => playTestSound(soundType),
    updateBinding: (id, binding) => updateBinding(id, binding),
    resetBinding: (id) => resetBinding(id),
    getSetting: (key) => settings?.[key],
    setPostProcessProvider: (providerId) => setPostProcessProvider(providerId),
    updatePostProcessBaseUrl: (providerId, baseUrl) =>
      updatePostProcessSetting("base_url", providerId, baseUrl),
    updatePostProcessApiKey: (providerId, apiKey) =>
      updatePostProcessApiKey(providerId, apiKey),
    updatePostProcessModel: (providerId, model) =>
      updatePostProcessSetting("model", providerId, model),
    fetchPostProcessModels: (providerId) => fetchPostProcessModels(providerId),
  };
};
