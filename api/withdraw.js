const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// CONFIGURATION
const BOT_TOKEN = process.env.BOT_TOKEN || "YOUR_TELEGRAM_BOT_TOKEN_HERE";
const HISTORY_CHANNEL_ID = process.env.HISTORY_CHANNEL_ID || "@Allwithdrawhistory"; // Channel Username or ID

// WITHDRAWAL REQUEST ENDPOINT
app.post('/api/withdraw', async (req, res) => {
  try {
    const { username, wallet, points, amountUsd } = req.body;

    // VALIDATION
    if (!username || !wallet || !points) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    const tonRegex = /^(EQ|UQ)[a-zA-Z0-9_-]{46}$/;
    if (!tonRegex.test(wallet)) {
      return res.status(400).json({ success: false, message: "Invalid TON wallet address format." });
    }

    if (parseFloat(points) < 150) {
      return res.status(400).json({ success: false, message: "Minimum cashout threshold is 150 points." });
    }

    // TELEGRAM CHANNEL MESSAGE FORMAT
    const message = `
🚀 *NEW WITHDRAWAL REQUEST* 🚀

👤 *User:* ${username}
💎 *Points Redeemed:* ${points} Ads Point
💵 *Estimated Value:* ~$${amountUsd || (points * 0.002).toFixed(2)} USD
🏦 *TON Wallet:* \`${wallet}\`
⏰ *Time:* ${new Date().toUTCString()}

✅ *Status:* Pending Review
    `;

    // SEND LOG TO TELEGRAM HISTORY CHANNEL
    const telegramApiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    await axios.post(telegramApiUrl, {
      chat_id: HISTORY_CHANNEL_ID,
      text: message,
      parse_mode: 'Markdown'
    });

    return res.status(200).json({
      success: true,
      message: "Withdrawal request submitted successfully and logged to history channel."
    });

  } catch (error) {
    console.error("Withdraw Error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to log withdrawal to Telegram channel."
    });
  }
});

// SERVER PORT LISTEN
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Withdrawal Service Engine active on port ${PORT}`);
});
