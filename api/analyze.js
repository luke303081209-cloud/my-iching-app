export default async function handler(req, res) {
  const KEY = process.env.GEMINI_API_KEY;
  if (!KEY) return res.status(200).json({ text: "钥匙丢失，请检查 Vercel 变量。" });

  if (req.method !== 'POST') return res.status(405).send("Method Not Allowed");

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { question, hexName, lang } = body;
    
    // 使用正式版 v1 路径，这是目前最稳定的地址
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${KEY}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ 
            text: `你是一位周易大师。用户问：${question}，卦象：${hexName}。请用${lang === 'zh' ? '中文' : '英文'}给出简要但深刻的解析。` 
          }] 
        }]
      })
    });

    const data = await response.json();

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const aiText = data.candidates[0].content.parts[0].text;
      res.status(200).json({ text: aiText });
    } else if (data.error) {
      // 如果 Google 还是报错，把具体的错误码吐出来方便排查
      res.status(200).json({ text: `Google 接口反馈错误 (${data.error.code}): ${data.error.message}` });
    } else {
      res.status(200).json({ text: "AI 暂时没有给出回应，可能是请求过于频繁，请稍后再试。" });
    }

  } catch (e) {
    res.status(200).json({ text: "系统运行错误: " + e.message });
  }
}
