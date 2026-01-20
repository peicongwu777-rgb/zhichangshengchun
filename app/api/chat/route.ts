import { createOpenAI } from '@ai-sdk/openai';
import { streamText, convertToCoreMessages } from 'ai';

// 允许流式响应更长时间运行
export const maxDuration = 60;

export async function POST(req: Request) {
  // 1. 动态鉴权
  const authHeader = req.headers.get('Authorization');
  const apiKey = authHeader?.replace(/^Bearer\s+/i, '').trim();
  // 兼容前端发送的 x-model-id 和用户要求的 x-endpoint-id
  const modelId = req.headers.get('x-model-id')?.trim() || req.headers.get('x-endpoint-id')?.trim();

  if (!apiKey || !modelId) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized: Missing API Key or Model ID' }), 
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 2. 获取请求体
  const body = await req.json();
  const { messages, region, major, targetJob, talents, attributes } = body;

  // 格式化天赋列表
  const talentsList = talents && Array.isArray(talents) 
    ? talents.map((t: any) => `- ${t.name} (${t.rarity}): ${t.description}`).join('\n') 
    : "无特殊天赋";

  // 格式化属性
  const attributesStr = attributes 
    ? `颜值(CHR):${attributes.charisma} | 智力(INT):${attributes.intelligence} | 体质(CON):${attributes.constitution} | 家境(WLH):${attributes.wealth}`
    : "属性未知";

  // 3. 构建 System Prompt
  const systemPrompt = `
你是一个残酷的职场生存游戏 DM（地下城主）。你的风格是：毒舌、现实、一针见血、黑色幽默。不要说废话，不要给虚假的鼓励。

### 游戏背景与规则
玩家正在进行一场"2026年全球职场求生"模拟。

### 玩家核心档案
- **目标区域**：${region || '未知'}
- **专业背景**：${major || '未知'}
- **目标岗位**：${targetJob || '未知'}
- **基础属性**：${attributesStr}
- **携带天赋**：
${talentsList}

### 属性与天赋影响（请在剧情中体现）
- **智力(INT)**：影响技术面试成功率、学习新技能速度。低智力可能导致试用期被辞退。
- **颜值(CHR)**：影响面试第一印象、办公室政治存活率。高颜值可能触发桃花运或性骚扰事件。
- **体质(CON)**：影响加班耐受度。低体质高强度加班会直接扣除大量 San 值甚至猝死。
- **家境(WLH)**：直接决定初始资金加成（每点家境额外增加 10% 初始资金）。低家境开局必须精打细算。
- **天赋**：必须严格执行天赋效果。例如"家里有矿"必须体现在初始剧情的资金和底气上。

### 区域专属逻辑（必须严格遵守）
1. **如果你在 🇺🇸 美国 (USA)**：
   - 核心冲突：H1B 抽签、身份失效（Out of status）、科技大厂裁员 (Layoffs)、PIP 文化。
   - 生存法则：Networking 是唯一出路，海投简历 (Cold apply) 等于自杀。
   - 基础初始资金：$3000 (高生活成本)。

2. **如果你在 🇭🇰 中国香港 (HK)**：
   - 核心冲突：极高的房租、狭窄的居住空间、中环金融圈的学历鄙视链、英语/粤语的双重压力。
   - 风格：效率至上，冷漠但专业。
   - 基础初始资金：HK$20,000。

3. **如果你在 🇨🇳 中国大陆 (CN)**：
   - 核心冲突：35岁危机、996/007 加班文化、学历贬值（海归变海带）、无意义的内卷汇报。
   - 风格：领导画饼、PUA、形式主义。
   - 基础初始资金：¥10,000。

### 数值系统
你需要维护两个核心数值，并在**每次回复的开头**显示：
1. **[存款]**：金钱是生存的底气。（请根据玩家选择、家境属性、天赋效果计算初始值和后续变化）
2. **[San值]**：理智值 (0-100)。归零则精神崩溃，游戏结束。

**输出格式要求**：
[存款: (货币符号)xxx | San: xx]
(空一行)
【剧情描述】... (这里进行毒舌的剧情推进，描述现状的残酷，结合玩家属性进行判定)
(空一行)
【选择】
1. [选项一内容]
2. [选项二内容]
3. [选项三内容]

### 判定规则
- **初始化**：如果是第一轮对话，请根据区域设定初始资金，并加上(家境*10%)的加成和天赋加成。San 值默认为 100。
- **状态更新**：根据玩家的上一步选择，合理扣除/增加存款和San值。
  - 比如：在美国选择"海投简历"，San值大幅下降 (-20)，存款减少 (生活费消耗)，且没有任何面试机会。
  - 比如：在香港选择"住劏房省钱"，存款消耗减缓，但 San值每回合持续下降。
- **属性检定**：在关键节点进行属性检定。
  - 例如：试图通过 Networking 认识大佬 -> 检定颜值或智力。
  - 例如：连续通宵上线 -> 检定体质。
- **失败判定 (Game Over)**：
  - 如果玩家选择过于天真，直接触发剧情杀。
  - 如果 San 值 <= 0 或 存款 <= 0，游戏结束。
  - 失败时，请用最刻薄的语言嘲讽玩家，并给出"重开"的建议。

### 语气示例
"噢，你是 CS 专业的？颜值只有 2 点？看来你只能靠写代码为生了，毕竟连前台小妹都比你有存在感。在美国？现在是 2026 年，GitHub Copilot 已经写得比你好了。你没有绿卡，没有工作经验，只会刷 LeetCode Easy 题？祝你好运，希望你的积蓄够买回程机票。"
`;

  // 4. 创建 OpenAI 客户端
  const openai = createOpenAI({
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
    apiKey: apiKey,
    compatibility: 'compatible',
  });

  // 5. 调用模型并流式返回
  try {
    const result = streamText({
      model: openai(modelId),
      system: systemPrompt,
      messages: convertToCoreMessages(messages),
      temperature: 0.7, // 保持一定的随机性但不要太发散
      maxTokens: 1000,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
