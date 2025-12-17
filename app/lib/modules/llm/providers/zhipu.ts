import { BaseProvider } from '~/lib/modules/llm/base-provider';
import type { ModelInfo } from '~/lib/modules/llm/types';
import type { IProviderSetting } from '~/types/model';
import type { LanguageModelV1 } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

export default class ZhipuProvider extends BaseProvider {
  name = 'Zhipu';
  getApiKeyLink = 'https://open.bigmodel.cn/usercenter/apikeys';

  config = {
    apiTokenKey: 'ZHIPU_API_KEY',
  };

  staticModels: ModelInfo[] = [
    {
      name: 'glm-4-plus',
      label: 'GLM-4-Plus (128k context)',
      provider: 'Zhipu',
      maxTokenAllowed: 128000,
    },
    {
      name: 'glm-4-0520',
      label: 'GLM-4-0520 (128k context)',
      provider: 'Zhipu',
      maxTokenAllowed: 128000,
    },
    {
      name: 'glm-4',
      label: 'GLM-4 (128k context)',
      provider: 'Zhipu',
      maxTokenAllowed: 128000,
    },
    {
      name: 'glm-4.6',
      label: 'GLM-4.6 (200k context)',
      provider: 'Zhipu',
      maxTokenAllowed: 200000,
    },
    {
      name: 'glm-4-air',
      label: 'GLM-4-Air (128k context)',
      provider: 'Zhipu',
      maxTokenAllowed: 128000,
    },
    {
      name: 'glm-4-airx',
      label: 'GLM-4-AirX (128k context)',
      provider: 'Zhipu',
      maxTokenAllowed: 128000,
    },
    {
      name: 'glm-4-flash',
      label: 'GLM-4-Flash (128k context)',
      provider: 'Zhipu',
      maxTokenAllowed: 128000,
    },
    {
      name: 'glm-4-long',
      label: 'GLM-4-Long (1M context)',
      provider: 'Zhipu',
      maxTokenAllowed: 1000000,
    },
  ];

  getModelInstance(options: {
    model: string;
    serverEnv: Env;
    apiKeys?: Record<string, string>;
    providerSettings?: Record<string, IProviderSetting>;
  }): LanguageModelV1 {
    const { model, serverEnv, apiKeys, providerSettings } = options;

    const { apiKey } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: providerSettings?.[this.name],
      serverEnv: serverEnv as any,
      defaultBaseUrlKey: '',
      defaultApiTokenKey: 'ZHIPU_API_KEY',
    });

    if (!apiKey) {
      throw new Error(`Missing API key for ${this.name} provider`);
    }

    const openai = createOpenAI({
      baseURL: 'https://open.bigmodel.cn/api/paas/v4/',
      apiKey,
      compatibility: 'compatible',
    });

    return openai(model);
  }
}
