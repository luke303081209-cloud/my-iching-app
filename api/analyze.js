export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question, hexName, lines, lang } = JSON.parse(req.body);
  const API_KEY = process.env.GEMINI_API_KEY; // 从环境变量读取

  const prompt = `
    你是一位精通《周易》、现代心理学和战略决策的智者。
    用户的问题是："${question}"
    得到的卦象是："${hexName}" (爻象序列: ${lines})
    请根据该卦象的卦辞和爻辞，为用户提供深度的解析。
    要求：
    1. 语言要优美、专业且具有启发性。
    2. 包含“现状分析”、“未来趋势”和“行动建议”三个部分。
    3. 请使用 ${lang === 'zh' ? '简体中文' : '英文'} 回答。
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    
    res.status(200).json({ text: resultText });
  } catch (error) {
    res.status(500).json({ error: 'AI 暂时无法连接，请稍后再试' });
  }
}
