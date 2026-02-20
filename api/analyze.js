export default async function handler(req, res) {
  const KEY = process.env.GEMINI_API_KEY;
  if (!KEY) return res.status(200).json({ text: "密钥丢失" });
  if (req.method !== 'POST') return res.status(405).send("Method Not Allowed");

  try {
    const { question, hexName, lang } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    
    // 【请确认这里是你之前测试成功的模型名】
    const modelName = "gemini-3-flash-preview"; 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${KEY}`;

    // 【强化 Prompt】
    const prompt = `你是一位精通《易经》三十年的国学大师，擅长结合阴阳消长和生活哲学进行指引。
用户的问题是："${question}"
占得卦象为："${hexName}"

请用${lang === 'zh' ? '中文' : '英文'}按以下格式进行深度解析：
1. 【卦象概论】：一句话说明此卦的吉凶趋势。
2. 【易理指引】：结合卦名（如${hexName}）解释当下的处境和天时地利。
3. 【具体建议】：针对用户的问题，给出宜做什么、忌做什么的具体行动指南。
4. 【禅心悟语】：送给用户的一句智慧箴言。

要求：语气沉稳、专业，多用“君子当...”、“宜...”、“不宜...”等语式，避免空泛。`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      res.status(200).json({ text: data.candidates[0].content.parts[0].text });
    } else {
      res.status(200).json({ text: "AI 大师正在冥想，请稍后再试。" });
    }
  } catch (e) {
    res.status(200).json({ text: "系统开小差了：" + e.message });
  }
}
