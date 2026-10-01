export default async function handler(req, res) {
  // CORS headers ထည့်ပေးခြင်းဖြင့် Vercel မှာ ေခါ်ရတာ အဆင်ပြေစေပါတယ်
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { username, wallet, amount } = req.body;

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8889834203:AAGGO2SD_WXXd_J_mU5e7Iww73zCEqmwMb4";
  const CHANNEL_ID = "@Allwithdrawhistory";

  const text = `🎉 *New Withdrawal Request!*\n\n` +
               `👤 *User:* ${username}\n` +
               `💎 *Amount:* ${amount} PTS\n` +
               `🏦 *Wallet:* \`${wallet}\`\n\n` +
               `⚡ *Ads Miner Auto-Logging System*`;

  try {
    const telegramRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHANNEL_ID,
        text: text,
        parse_mode: 'Markdown'
      })
    });

    const data = await telegramRes.json();
    if (data.ok) {
      return res.status(200).json({ success: true, message: 'Log sent to channel' });
    } else {
      return res.status(500).json({ success: false, error: data.description });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
