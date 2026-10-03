const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

// CONFIGURATION
const BOT_TOKEN = process.env.BOT_TOKEN || "8889834203:AAGGO2SD_WXXd_J_mU5e7Iww73zCEqmwMb4";
const HISTORY_CHANNEL_ID = process.env.HISTORY_CHANNEL_ID || "@Allwithdrawhistory";
const SECRET_KEY = process.env.SECRET_KEY || "alta_ads_miner_secure_hash_2026";

// SECURE WITHDRAWAL ENDPOINT WITH SIGNATURE VERIFICATION
app.post('/api/withdraw', async (req, res) => {
  try {
    const { username, wallet, points, amountUsd, timestamp, signature } = req.body;

    // 1. FIELD VALIDATION
    if (!username || !wallet || !points || !timestamp || !signature) {
      return res.status(400).json({ success: false, message: "Security violation: Missing parameter payload." });
    }

    // 2. TIMESTAMP EXPIRATION CHECK (MAX 2 MINUTES)
    if (Math.abs(Date.now() - timestamp) > 120000) {
      return res.status(403).json({ success: false, message: "Security violation: Request expired." });
    }

    // 3. HMAC SIGNATURE VERIFICATION (PREVENTS API BOT ATTACKS)
    const expectedSignature = crypto.createHmac('sha256', SECRET_KEY)
      .update(`${username}_${points}_${timestamp}`)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(401).json({ success: false, message: "Security violation: Invalid HMAC signature." });
    }

    // 4. TON WALLET REGEX CHECK
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
💵 *Estimated Value:* ~$${amountUsd || (points * 0.00003).toFixed(5)} USD
🏦 *TON Wallet:* \`${wallet}\`
⏰ *Time:* ${new Date().toUTCString()}

✅ *Status:* Pending Review
🔒 *Security Status:* HMAC Verified
    `;

    // SEND LOG TO TELEGRAM CHANNEL
    const telegramApiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    await axios.post(telegramApiUrl, {
      chat_id: HISTORY_CHANNEL_ID,
      text: message,
      parse_mode: 'Markdown'
    });

    return res.status(200).json({
      success: true,
      message: "Withdrawal request verified and submitted successfully."
    });

  } catch (error) {
    console.error("Withdraw Error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to log withdrawal to Telegram channel."
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Withdrawal Service Engine active on port ${PORT}`);
});
