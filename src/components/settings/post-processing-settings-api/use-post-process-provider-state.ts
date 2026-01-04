import { useSettings } from "../../../hooks/use-settings";
import type { PostProcessProvider } from "../../../lib/types";
import { getDefaultBaseUrl } from "./default-providers";
import type { ModelOption } from "./types";

type DropdownOption = {
  value: string;
  label: string;
};

type PostProcessProviderState = {
  enabled: boolean;
  providerOptions: DropdownOption[];
  selectedProviderId: string;
  selectedProvider: PostProcessProvider | undefined;
  isCustomProvider: boolean;
  isOllamaProvider: boolean;
  isLocalProvider: boolean;
  baseUrl: string;
  defaultBaseUrl: string | undefined;
  isBaseUrlModified: boolean;
  handleBaseUrlChange: (value: string) => void;
  handleBaseUrlReset: () => void;
  isBaseUrlUpdating: boolean;
  apiKey: string;
  handleApiKeyChange: (value: string) => void;
  isApiKeyUpdating: boolean;
  model: string;
  handleModelChange: (value: string) => void;
  modelOptions: ModelOption[];
  isModelUpdating: boolean;
  isFetchingModels: boolean;
  handleProviderSelect: (providerId: string) => void;
  handleModelSelect: (value: string) => void;
  handleModelCreate: (value: string) => void;
  handleRefreshModels: () => void;
};

export const usePostProcessProviderState = (): PostProcessProviderState => {
  const {
    settings,
    isUpdating,
    setPostProcessProvider,
    updatePostProcessBaseUrl,
    updatePostProcessApiKey,
    updatePostProcessModel,
    fetchPostProcessModels,
    postProcessModelOptions,
  } = useSettings();

  // Settings are guaranteed to have providers after migration
  const providers = settings?.post_process_providers || [];

  const selectedProviderId =
    settings?.post_process_provider_id || providers[0]?.id || "openai";

  const selectedProvider =
    providers.find((provider) => provider.id === selectedProviderId) ||
    providers[0];

  // Use settings directly as single source of truth
  const baseUrl = selectedProvider?.base_url ?? "";
  const defaultBaseUrl = getDefaultBaseUrl(selectedProviderId);
  const isBaseUrlModified =
    defaultBaseUrl !== undefined &&
    (baseUrl !== defaultBaseUrl || baseUrl === "");
  const apiKey = (settings?.post_process_api_keys?.[selectedProviderId] ??
    "") as string;
  const model = (settings?.post_process_models?.[selectedProviderId] ??
    "") as string;

  const providerOptions: DropdownOption[] = providers.map((provider) => ({
    value: provider.id,
    label: provider.label,
  }));

  const handleProviderSelect = (providerId: string) => {
    if (providerId !== selectedProviderId) {
      void setPostProcessProvider(providerId);
    }
  };

  const handleBaseUrlChange = (value: string) => {
    if (!(selectedProvider && selectedProvider.allow_base_url_edit)) {
      return;
    }
    const trimmed = value.trim();
    if (trimmed && trimmed !== baseUrl) {
      void updatePostProcessBaseUrl(selectedProvider.id, trimmed);
    }
  };

  const handleBaseUrlReset = () => {
    if (
      !(
        selectedProvider &&
        selectedProvider.allow_base_url_edit &&
        defaultBaseUrl
      )
    ) {
      return;
    }
    if (baseUrl !== defaultBaseUrl) {
      void updatePostProcessBaseUrl(selectedProvider.id, defaultBaseUrl);
    }
  };

  const handleApiKeyChange = (value: string) => {
    const trimmed = value.trim();
    if (trimmed !== apiKey) {
      void updatePostProcessApiKey(selectedProviderId, trimmed);
    }
  };

  const handleModelChange = (value: string) => {
    const trimmed = value.trim();
    if (trimmed !== model) {
      void updatePostProcessModel(selectedProviderId, trimmed);
    }
  };

  const handleModelSelect = (value: string) => {
    void updatePostProcessModel(selectedProviderId, value.trim());
  };

  const handleModelCreate = (value: string) => {
    void updatePostProcessModel(selectedProviderId, value);
  };

  const handleRefreshModels = () => {
    void fetchPostProcessModels(selectedProviderId);
  };

  const availableModelsRaw = postProcessModelOptions[selectedProviderId] || [];

  const modelOptions: ModelOption[] = (() => {
    const seen = new Set<string>();
    const options: ModelOption[] = [];

    const upsert = (value: string | null | undefined) => {
      const trimmed = value?.trim();
      if (!trimmed || seen.has(trimmed)) return;
      seen.add(trimmed);
      options.push({ value: trimmed, label: trimmed });
    };

    // Add available models from API
    for (const candidate of availableModelsRaw) {
      upsert(candidate);
    }

    // Ensure current model is in the list
    upsert(model);

    return options;
  })();

  const isBaseUrlUpdating = isUpdating(
    `post_process_base_url:${selectedProviderId}`
  );
  const isApiKeyUpdating = isUpdating(
    `post_process_api_key:${selectedProviderId}`
  );
  const isModelUpdating = isUpdating(
    `post_process_model:${selectedProviderId}`
  );
  const isFetchingModels = isUpdating(
    `post_process_models_fetch:${selectedProviderId}`
  );

  // Ollama and custom providers don't require API keys
  const isCustomProvider = selectedProvider?.id === "custom";
  const isOllamaProvider = selectedProvider?.id === "ollama";
  const isLocalProvider = isCustomProvider || isOllamaProvider;

  // Auto-fetch models when provider changes
  // Note: useSettings hook should handle this, but we trigger it here for provider changes
  // The fetchPostProcessModels will handle API key validation internally

  return {
    enabled: true,
    providerOptions,
    selectedProviderId,
    selectedProvider,
    isCustomProvider,
    isOllamaProvider,
    isLocalProvider,
    baseUrl,
    defaultBaseUrl,
    isBaseUrlModified,
    handleBaseUrlChange,
    handleBaseUrlReset,
    isBaseUrlUpdating,
    apiKey,
    handleApiKeyChange,
    isApiKeyUpdating,
    model,
    handleModelChange,
    modelOptions,
    isModelUpdating,
    isFetchingModels,
    handleProviderSelect,
    handleModelSelect,
    handleModelCreate,
    handleRefreshModels,
  };
};
