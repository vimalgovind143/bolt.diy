import { BaseProvider } from '~/lib/modules/llm/base-provider';
import type { ModelInfo } from '~/lib/modules/llm/types';
import type { IProviderSetting } from '~/types/model';
import type { LanguageModelV1 } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

export default class ChutesProvider extends BaseProvider {
  name = 'Chutes';
  getApiKeyLink = 'https://chutes.ai/';

  config = {
    baseUrlKey: 'CHUTES_API_BASE_URL',
    apiTokenKey: 'CHUTES_API_KEY',
    baseUrl: 'https://llm.chutes.ai/v1',
  };

  staticModels: ModelInfo[] = [];

  async getDynamicModels(
    apiKeys?: Record<string, string>,
    settings?: IProviderSetting,
    serverEnv: Record<string, string> = {},
  ): Promise<ModelInfo[]> {
    const { baseUrl, apiKey } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: settings,
      serverEnv,
      defaultBaseUrlKey: 'CHUTES_API_BASE_URL',
      defaultApiTokenKey: 'CHUTES_API_KEY',
    });

    if (!baseUrl || !apiKey) {
      return [];
    }

    try {
      const response = await fetch(`${baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const res = (await response.json()) as any;

      return res.data.map((model: any) => {
        const maxTokenAllowed = model.context_length || model.max_model_len || 128000;
        return {
          name: model.id,
          label: `${model.id} (${Math.floor(maxTokenAllowed / 1000)}k context)`,
          provider: this.name,
          maxTokenAllowed,
        };
      });
    } catch (error) {
      console.log(`${this.name}: Not allowed to GET /models endpoint for provider`, error);
      return [];
    }
  }

  getModelInstance(options: {
    model: string;
    serverEnv: Env;
    apiKeys?: Record<string, string>;
    providerSettings?: Record<string, IProviderSetting>;
  }): LanguageModelV1 {
    const { model, serverEnv, apiKeys, providerSettings } = options;

    const { baseUrl, apiKey } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: providerSettings?.[this.name],
      serverEnv: serverEnv as any,
      defaultBaseUrlKey: 'CHUTES_API_BASE_URL',
      defaultApiTokenKey: 'CHUTES_API_KEY',
    });

    if (!apiKey) {
      throw new Error(`Missing API key for ${this.name} provider`);
    }

    const openai = createOpenAI({
      baseURL: baseUrl || 'https://llm.chutes.ai/v1',
      apiKey,
      compatibility: 'compatible',
    });

    return openai(model);
  }
}
