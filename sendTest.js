require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 🔹 Add your email list here
const contacts = [
  { name: "Kartikeya", email: "kartikeya.raj29@gmail.com" },
  { name: "rajjev", email: "rajeevbhaskar7@gmail.com" }
];

// 🔹 Random delay between 20–40 seconds
function delay() {
  return Math.floor(Math.random() * 20000) + 20000;
}

async function sendBulk() {
  for (let contact of contacts) {
    try {

      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: contact.email,
        subject: `Quick question ${contact.name}`,
        text: `Hi ${contact.name},

I wanted to connect with you regarding website & app development services.

Let me know if you're interested.

Regards,
Digital Vibe`
      });

      console.log(`Sent to ${contact.email}`);

      await new Promise(r => setTimeout(r, delay()));

    } catch (error) {
      console.log("Error:", error);
    }
  }

  console.log("All emails sent!");
}

sendBulk();