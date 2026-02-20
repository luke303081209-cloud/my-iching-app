export default async function handler(req, res) {
  const KEY = process.env.GEMINI_API_KEY;
  if (!KEY) return res.status(200).json({ text: "密钥未配置，请检查 Vercel 环境变量。" });

  if (req.method !== 'POST') return res.status(405).send("仅支持 POST 请求");

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { question, hexName, lang } = body;
    
    // 换成目前最兼容的 v1beta 路径，并使用 gemini-1.5-flash-latest
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${KEY}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ 
            text: `你是一位精通易经的大师。用户问：${question}，卦象：${hexName}。请用${lang === 'zh' ? '中文' : '英文'}给出深刻且专业的解析，包含现状和建议。` 
          }] 
        }]
      })
    });

    const data = await response.json();

    // 增加更严格的返回检查
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const aiText = data.candidates[0].content.parts[0].text;
      res.status(200).json({ text: aiText });
    } else if (data.error) {
      res.status(200).json({ text: `Google API 报告错误: ${data.error.message} (代码: ${data.error.code})` });
    } else {
      res.status(200).json({ text: "AI 响应格式异常，请稍后再试。详细信息：" + JSON.stringify(data).substring(0, 100) });
    }

  } catch (e) {
    res.status(200).json({ text: "服务器逻辑错误: " + e.message });
  }
}
