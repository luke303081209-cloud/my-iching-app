export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 增加更健壮的参数获取逻辑
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const { question, hexName, lang } = body;
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'Environment Variable GEMINI_API_KEY is missing' });
  }

  const prompt = `你是一位精通易经的智者。用户问："${question}"，卦象："${hexName}"。请用${lang === 'zh' ? '中文' : '英文'}解析。`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();
    // 检查 Gemini 侧是否返回了错误
    if (data.error) {
        return res.status(500).json({ error: 'Gemini API Error: ' + data.error.message });
    }
    
    const resultText = data.candidates[0].content.parts[0].text;
    res.status(200).json({ text: resultText });
  } catch (error) {
    res.status(500).json({ error: 'Server Error: ' + error.message });
  }
}
