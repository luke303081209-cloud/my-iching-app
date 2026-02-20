export default async function handler(req, res) {
  const KEY = process.env.GEMINI_API_KEY;
  if (!KEY) return res.status(200).json({ text: "密钥未配置，请检查 Vercel 环境变量。" });

  if (req.method !== 'POST') return res.status(405).send("Method Not Allowed");

  try {
    const { question, hexName, lang } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    
    // 我们直接用最原始、兼容性最强的模型路径
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${KEY}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ 
            text: `你是一位精通周易的大师。用户问：${question}，卦象：${hexName}。请用${lang === 'zh' ? '中文' : '英文'}给出简短而深刻的解析。` 
          }] 
        }]
      })
    });

    const data = await response.json();

    // 如果 gemini-pro 也报错，我们捕获它并显示出来
    if (data.candidates && data.candidates[0]) {
      res.status(200).json({ text: data.candidates[0].content.parts[0].text });
    } else if (data.error) {
      // 这里的错误提示可以帮我们精准定位：是 Key 的问题还是 Google 的服务问题
      res.status(200).json({ text: `Google API 报告错误: ${data.error.message} (${data.error.status})` });
    } else {
      res.status(200).json({ text: "AI 暂时无法解析此卦，请稍后再试。" });
    }

  } catch (e) {
    res.status(200).json({ text: "服务器逻辑异常: " + e.message });
  }
}
