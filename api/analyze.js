export default async function handler(req, res) {
  const KEY = process.env.GEMINI_API_KEY;
  if (!KEY) return res.status(200).json({ text: "钥匙丢失，请检查 Vercel 变量。" });

  if (req.method !== 'POST') return res.status(405).send("Method Not Allowed");

  try {
    const { question, hexName } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `你是一位周易大师。用户问：${question}，卦象：${hexName}。请给出简要解析。` }] }]
      })
    });

    const data = await response.json();

    // 深度兼容逻辑：防止读取 '0' 出错
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const aiText = data.candidates[0].content.parts[0].text;
      res.status(200).json({ text: aiText });
    } else if (data.error) {
      res.status(200).json({ text: "Google API 报错: " + data.error.message });
    } else {
      res.status(200).json({ text: "AI 返回了空结果，请稍后再试。详细响应：" + JSON.stringify(data).substring(0, 50) });
    }

  } catch (e) {
    res.status(200).json({ text: "系统运行错误: " + e.message });
  }
}
