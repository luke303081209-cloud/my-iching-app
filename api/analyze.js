export default async function handler(req, res) {
  const KEY = process.env.GEMINI_API_KEY;
  if (!KEY) return res.status(200).json({ text: "密钥未配置，请检查 Vercel 环境变量。" });
  if (req.method !== 'POST') return res.status(405).send("Method Not Allowed");

  try {
    const { question, hexName, lang } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    
    // 【核心改动】根据你的截图，使用 Gemini 3 Flash 的专用预览版模型路径
    const modelName = "gemini-3-flash-preview"; 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${KEY}`;

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

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      res.status(200).json({ text: data.candidates[0].content.parts[0].text });
    } else if (data.error) {
      // 这里的报错会告诉我们，是不是需要换回 gemini-1.5-flash 或 gemini-2.0-flash-exp
      res.status(200).json({ text: `Google API 报告 (${data.error.status}): ${data.error.message}。建议检查模型名称是否为 ${modelName}` });
    } else {
      res.status(200).json({ text: "AI 响应格式异常。建议在 Google AI Studio 确认当前可用模型确切名称。" });
    }

  } catch (e) {
    res.status(200).json({ text: "服务器逻辑异常: " + e.message });
  }
}
