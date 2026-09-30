export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { username, wallet, amount } = req.body;

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8600671562:AAFYO8KewkhoCIrw_wxvfoEQvfFF4EW5iLw";
  const CHANNEL_ID = "-1004291919386"; // @Allwithdrawhistory

  const text = ` <b>New Withdrawal Request!</b>\n\n` +
               ` <b>User:</b> ${username}\n` +
               ` <b>Amount:</b> ${amount} PTS ($0.01 USDT)\n` +
               ` <b>Wallet:</b> <code>${wallet}</code>\n\n` +
               ` <i>ADS MINER Auto-Logging System</i>`;

  try {
    const telegramRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHANNEL_ID,
        text: text,
        parse_mode: 'HTML'
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
