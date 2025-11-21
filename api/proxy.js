export default async function handler(req, res) {
  // 1. 安全檢查：只允許 POST 請求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. 取得環境變數
  const N8N_URL = process.env.N8N_WEBHOOK_URL;
  // 👇 新增：讀取密碼 (記得在 Vercel 後台設定這個變數)
  const N8N_KEY = process.env.N8N_SECRET_KEY; 

  if (!N8N_URL) {
    return res.status(500).json({ error: 'Server Configuration Error (Missing URL)' });
  }

  try {
    // 3. 轉發請求給 n8n (並附上密碼)
    const n8nResponse = await fetch(N8N_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 👇 關鍵：把密碼塞進 Header 傳給 n8n
        // 注意：這裡的 'x-api-key' 必須跟你在 n8n 設定的 Header Name 一模一樣
        'TravelPlan-Secret': N8N_KEY 
      },
      body: JSON.stringify(req.body),
    });

    // 檢查 n8n 是否報錯
    if (!n8nResponse.ok) {
        const errorText = await n8nResponse.text();
        return res.status(n8nResponse.status).send(errorText);
    }

    const data = await n8nResponse.json();

    // 4. 回傳成功結果
    return res.status(200).json(data);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch from n8n' });
  }
}