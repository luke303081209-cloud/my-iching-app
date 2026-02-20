export default async function handler(req, res) {
  const KEY = process.env.GEMINI_API_KEY;
  
  // 自检：如果没钥匙，直接在网页上告诉你
  if (!KEY) {
    return res.status(200).json({ text: "系统检测到：Vercel 后台没有配置 GEMINI_API_KEY 变量，请先去 Settings 检查。" });
  }

  if (req.method === 'POST') {
    try {
      const { question, hexName } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const prompt = `用户问：${question}，卦象：${hexName}。请给出简短解析。`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      const data = await response.json();
      res.status(200).json({ text: data.candidates[0].content.parts[0].text });
    } catch (e) {
      res.status(200).json({ text: "连接 AI 成功但解析出错：" + e.message });
    }
  } else {
    res.status(405).send("Method Not Allowed");
  }
}
