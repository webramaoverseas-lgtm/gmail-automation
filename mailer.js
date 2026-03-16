const nodemailer = require("nodemailer");

/**
 * Sends an email using the Gmail Bridge if available, otherwise falls back to direct Nodemailer.
 */
async function sendEmail({ to, subject, body, isHtml = true }) {
  const bridgeUrl = process.env.GMAIL_BRIDGE_URL;

  if (bridgeUrl && bridgeUrl.startsWith("http")) {
    try {
      console.log(`[MAILER] Attempting to send via Gmail Bridge: ${to}`);
      const axios = require("axios");
      const response = await axios.post(bridgeUrl, {
        to,
        subject,
        body,
        isHtml
      }, {
        headers: { "Content-Type": "application/json" }
      });

      if (response.data && response.data.success) {
        console.log(`[MAILER] Bridge Success: ${to}`);
        return { success: true };
      }
      console.warn(`[MAILER] Bridge failed: ${response.data ? response.data.error : "Unknown error"}. Falling back to Nodemailer...`);
    } catch (err) {
      console.warn(`[MAILER] Bridge unreachable: ${err.message}. Falling back to Nodemailer...`);
    }
  }

  // Fallback to Nodemailer
  try {
    console.log(`[MAILER] Sending directly via Nodemailer: ${to}`);
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      [isHtml ? "html" : "text"]: body
    });

    console.log(`[MAILER] Nodemailer Success: ${to}`);
    return { success: true };
  } catch (err) {
    console.error(`[MAILER] All sending methods failed: ${err.message}`);
    console.error(err.stack);
    return { success: false, error: err.message };
  }
}

module.exports = { sendEmail };
