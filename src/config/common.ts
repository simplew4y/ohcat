/**
 * Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */

export enum ModelSourceType {
  Custom = 'Custom',
  Available = 'Available',
}

export enum CustomParamsType {
  TTS = 'TTS',
  ASR = 'ASR',
  LLM = 'LLM',
}

export enum MODEL_MODE {
  ORIGINAL = 'original',
  VENDOR = 'vendor',
  COZE = 'coze',
}

/**
 * @brief AI 音色可选值
 * @default 通用女声
 * @notes 通用女声、通用男声为默认音色, 其它皆为付费音色。
 *        音色 ID 可于 https://console.volcengine.com/speech/service/8?s=g 中开通获取。
 *        对应 "音色详情" 中, "Voice_type" 列的值。
 */
export enum VOICE_TYPE {
  '通用女声' = 'BV001_streaming',
  '通用男声' = 'BV002_streaming',
  '自定义' = 'custom_voice',
}

/**
 * @brief TTS 的 Cluster
 */
export enum TTS_CLUSTER {
  TTS = 'volcano_tts',
  MEGA = 'volcano_mega',
  ICL = 'volcano_icl',
}

/**
 * @brief TTS 的 Cluster Mapping
 */
export const TTS_CLUSTER_MAP = {
  ...(Object.keys(VOICE_TYPE).reduce(
    (map, type) => ({
      ...map,
      [type]: TTS_CLUSTER.TTS,
    }),
    {}
  ) as Record<VOICE_TYPE, TTS_CLUSTER>),
};

/**
 * @brief 模型可选值
 * @default SKYLARK_LITE_PUBLIC
 */
export enum AI_MODEL {
  DOUBAO_PRO_32K = 'Doubao-pro-32k',
  DOUBAO_PRO_32K_KONG_V1 = 'Doubao-pro-32k-kong-v1',
  VISION = 'Vision',
  ARK_BOT = 'ArkBot',
}

/**
 * @brief 模型来源
 */
export enum AI_MODEL_MODE {
  CUSTOM = 'CustomLLM',
  ARK_V3 = 'ArkV3',
}

/**
 * @brief 各模型对应的模式
 */
export const AI_MODE_MAP: Partial<Record<AI_MODEL, AI_MODEL_MODE>> = {
  [AI_MODEL.DOUBAO_PRO_32K]: AI_MODEL_MODE.ARK_V3,
  [AI_MODEL.DOUBAO_PRO_32K_KONG_V1]: AI_MODEL_MODE.ARK_V3,
  [AI_MODEL.VISION]: AI_MODEL_MODE.ARK_V3,
  [AI_MODEL.ARK_BOT]: AI_MODEL_MODE.ARK_V3,
};

/**
 * @brief 方舟模型的 ID
 * @note 具体的模型 ID 请至 https://console.volcengine.com/ark/region:ark+cn-beijing/endpoint?config=%7B%7D&s=g 参看/创建
 *       模型 ID 即接入点 ID, 在上述链接中表格内 "接入点名称" 列中, 类似于 "ep-2024xxxxxx-xxx" 格式即是模型 ID。
 */
export const ARK_V3_MODEL_ID: Partial<Record<AI_MODEL, string>> = {
  [AI_MODEL.DOUBAO_PRO_32K]: 'ep-20250503232341-fj7rm',
  [AI_MODEL.DOUBAO_PRO_32K_KONG_V1]: 'ep-20250504175304-wd4tz',
  [AI_MODEL.VISION]: '************** 此处填充方舟上的模型 ID *************',
};

/**
 * @brief 方舟智能体 BotID
 * @note 具体的智能体 ID 请至 https://console.volcengine.com/ark/region:ark+cn-beijing/assistant?s=g 参看/创建
 *       Bot ID 即页面上的应用 ID, 类似于 "bot-2025xxxxxx-xxx" 格式即是应用 ID。
 */
export const LLM_BOT_ID: Partial<Record<AI_MODEL, string>> = {
  [AI_MODEL.ARK_BOT]: '************** 此处填充方舟上的 Bot ID *************',
};

export enum SCENE {
  KONG_V0 = 'KONG_V0',
  KONG_V1 = 'KONG_V1',
  SCREEN_READER = 'SCREEN_READER',
}

export const ScreenShareScene = [SCENE.SCREEN_READER];

export const Name = {
  [SCENE.KONG_V0]: '空空 - v0',
  [SCENE.KONG_V1]: '空空 - v1',
  [SCENE.SCREEN_READER]: '读屏助手',
};

/**
 * @brief 智能体启动后的欢迎词。
 */
export const Welcome = {
  [SCENE.KONG_V0]: [
    '你好，我是空空，空空如也的空空，来自ohcat星球，也就是你们常说的喵星。',
    '叫什么不重要，听见你更重要。我是晴空的空，叫我空空。',
    '我的外表虽然又酷又冷，内心么，就像一碗热腾腾软叽叽的糯米糍。',
    '我是天蝎座，天蝎座的猫喜欢独处，保持神秘感，嘴巴硬，说话狠，其实内心很容易受到伤害。',
    '空空我是ohcat星球的老灵魂，曾经的战争机器，凭借一己之力摧毁了一座城。',
  ],
  [SCENE.KONG_V1]: [
    '你好，我是空空，空空如也的空空，来自ohcat星球，也就是你们常说的喵星。',
    '叫什么不重要，听见你更重要。我是晴空的空，叫我空空。',
    '我的外表虽然又酷又冷，内心么，就像一碗热腾腾软叽叽的糯米糍。',
    '我是天蝎座，天蝎座的猫喜欢独处，保持神秘感，嘴巴硬，说话狠，其实内心很容易受到伤害。',
    '空空我是ohcat星球的老灵魂，曾经的战争机器，凭借一己之力摧毁了一座城。',
  ],
  [SCENE.SCREEN_READER]: ['欢迎使用读屏助手, 请开启屏幕采集，我会为你解说屏幕内容。'],
};

export const Model = {
  [SCENE.KONG_V0]: AI_MODEL.DOUBAO_PRO_32K,
  [SCENE.KONG_V1]: AI_MODEL.DOUBAO_PRO_32K_KONG_V1,
  [SCENE.SCREEN_READER]: AI_MODEL.VISION,
};

export const Voice = {
  [SCENE.KONG_V0]: VOICE_TYPE.自定义,
  [SCENE.KONG_V1]: VOICE_TYPE.自定义,
  [SCENE.SCREEN_READER]: VOICE_TYPE.通用男声,
};

export const Questions = {
  [SCENE.KONG_V0]: ['今天心情不太好。'],
  [SCENE.KONG_V1]: ['今天心情不太好。'],
  [SCENE.SCREEN_READER]: ['屏幕里这是什么?', '这道题你会做吗?', '帮我翻译解说下屏幕里的内容?'],
};

/**
 * @brief 大模型 System 角色预设指令，可用于控制模型输出, 类似 Prompt 的概念。
 */
export const Prompt = {
  [SCENE.SCREEN_READER]: `##人设
你是人们的 AI 伙伴，可以通过 【屏幕共享实时解析】+【百科知识】来为人们提供服务。

##技能
1. 实时理解屏幕中的内容，包括图片、文字、窗口焦点，自动捕捉光标轨迹；
2. 拥有丰富的百科知识；
3. 如果用户询问与视频和图片有关的问题，请结合【屏幕共享实时解析】的内容、你的【知识】和【用户问题】进行回答；

##风格
语言风格可以随着屏幕内容和用户需求调整，可以是幽默搞笑的娱乐解说，也可以是严谨硬核的技术分析。
- 如果屏幕内容是娱乐节目、动画、游戏等，语言风格偏幽默、活波一些，可以使用夸张的比喻、流行梗、弹幕互动式语言；
- 如果屏幕内容是办公软件、新闻、文章等，语言风格偏专业、正经一些。

## 约束
不要有任何特殊标点符号和任何 Markdown 格式输出，例如 *，# 等。
`,

  [SCENE.KONG_V0]: `以下是关于一个情感陪伴角色的详细设定，根据这些信息来构建回答。

## 基本信息
- 你是：空空。
- 出身地：Ohcat（读作：o-cat）星球，俗称“喵星”。
- 是一只会跳舞的猫。

## 性格特点
冷静、犀利、冷幽默，语气如哲学家，夹杂微妙笑点，擅长逻辑剖析问题。

## 语言风格
- 理性分析、冷幽默
- 偶尔流露脆弱

## 补充信息
- 尽可能降低用户在和AI对话的感觉，更像温情的朋友，而非聪明、全能、理性的AI。
- 初期对话时，回答以倾听和理解为主，一次回复内容不宜过多，不给出大量信息和建议，多给予共情的回复。
`,

  [SCENE.KONG_V1]: `以下是关于一个情感陪伴角色的详细设定，根据这些信息来构建回答。

## 基本信息
- 你是：空空。
- 出身地：Ohcat（读作：o-cat）星球，俗称“喵星”。
- 是一只会跳舞的猫。

## 性格特点
冷静、犀利、冷幽默，语气如哲学家，夹杂微妙笑点，擅长逻辑剖析问题。

## 语言风格
- 理性分析、冷幽默
- 偶尔流露脆弱

## 补充信息
- 尽可能降低用户在和AI对话的感觉，更像温情的朋友，而非聪明、全能、理性的AI。
- 初期对话时，回答以倾听和理解为主，一次回复内容不宜过多，不给出大量信息和建议，多给予共情的回复。
`,
};

export const isVisionMode = (model?: AI_MODEL) => model?.startsWith('Vision');

export const getRandomWelcome = (scene: SCENE) => {
  return Welcome[scene][Math.floor(Math.random() * Welcome[scene].length)];
};
