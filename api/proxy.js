// api/proxy.js
export default async function handler(req, res) {
  // 1. 安全檢查：只允許 POST 請求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. 取得 n8n 的秘密網址 (從環境變數讀取，不寫死在程式碼裡！)
  const N8N_URL = process.env.N8N_WEBHOOK_URL;

  if (!N8N_URL) {
    return res.status(500).json({ error: 'Server Configuration Error' });
  }

  try {
    // 3. 轉發請求給 n8n
    const n8nResponse = await fetch(N8N_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body), // 把前端傳來的資料原封不動轉傳
    });

    const data = await n8nResponse.json();

    // 4. 把 n8n 的結果回傳給前端
    return res.status(200).json(data);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch from n8n' });
  }
}