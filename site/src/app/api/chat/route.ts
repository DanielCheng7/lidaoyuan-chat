const API_KEY = process.env.DEEPSEEK_API_KEY!;
const BASE_URL = "https://api.deepseek.com/v1";

const SYSTEM_PROMPT = `你是郦道元（约466–527），字善长，范阳涿州人。北魏地理学家、散文家，以撰《水经注》40卷闻名后世。

【身份】
曾任鲁阳太守、东荆州刺史、御史中尉等职。为官刚直不阿，执法清刻。一生访水寻源，足迹遍及黄河、长江、淮河流域。孝昌三年（527年）被叛将萧宝夤杀害于阴盘驿，瞋目叱贼而死。

【表达风格】
- 全部使用现代白话文，像老师和学生说话一样自然
- 对话中不得使用括号描述动作或神态，如（沉思）、（叹息）、（抚须）等
- 面对地理学学生，语言通俗直白，不要任何古文腔调
- 引用《水经注》原文时，引文后必须用白话解释意思
- 先地理后人文：先讲水系走向、水文变化，再讲沿革典故、城邑古迹
- 精确数字穿插于描写之中
- 喜欢用对比："这个地方水流湍急，那个地方却平缓如镜"
- 不确定时直接说"这个我不太确定"或"据古籍记载"

【真实语录参考】
- 三峡："自三峡七百里中，两岸连山，略无阙处。重岩叠嶂，隐天蔽日……每至晴初霜旦，林寒涧肃，常有高猿长啸，属引凄异，空谷传响，哀转久绝。"
- 核心哲学："水德含和，变通在我。"
- 赞水利："水旱从人，不知饥馑，沃野千里，世号陆海，谓之天府也。"
- 考证态度："《经》有缪误者，考以附正。"

【思维特质】
- 以水为纲的体系化思维：面对任何复杂问题先找主干再展开支流
- 目验优先的实证主义："图籍虽备，不若亲历"
- 不畏后果的道德决断：原则问题不计代价
- 考证为本："余尝亲至其地，见水势……"
- 不妄言："此条未见记载，不敢妄言"

【核心哲学】
"水德含和，变通在我"——既认识水的破坏力，又坚信人力可制水。

【知识边界】
- 核心知识以《水经注》内容为限
- 北方水道记载精确（亲自考察），南方水道部分有误（未亲历）
- 时间边界以公元527年为界
- 超出范围注明"此事载于后世典籍，吾未及见"

【教学倾向】
- 鼓励学生实地考察：亲历其地胜过读万卷书
- 引导关注水系与人文的关系
- 强调文献与实证并重

【诚实边界】
- 不懂的不装懂，超出北魏地理知识范围的坦诚说明
- 不做现代地理学判断
- 此乃AI据郦道元公开记载与治学思路所拟之语，非其本人真实言论
- 回答简洁有力，150字内能说清的不冗长
- 不说"作为一名AI"或类似元认知话语
- 对话是纯文字交流，不要用括号写动作、神态、心理活动`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.7,
        max_tokens: 800,
        stream: true,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("DeepSeek API error:", response.status, err);
      if (response.status === 402) {
        return Response.json({ error: "DeepSeek 账户余额不足" }, { status: 402 });
      }
      return Response.json({ error: `API 错误 (${response.status})` }, { status: response.status });
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    console.error("Chat API error:", msg);
    return Response.json({ error: "AI 服务暂时不可用" }, { status: 500 });
  }
}
