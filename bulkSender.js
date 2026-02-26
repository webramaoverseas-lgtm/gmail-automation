require("dotenv").config();
const nodemailer = require("nodemailer");
const csv = require("csv-parser");
const fs = require("fs");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

function delay() {
  return Math.floor(Math.random() * 20000) + 20000; // 20–40 sec
}

async function sendEmail(contact) {
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: contact.email,
    subject: `Quick question ${contact.name}`,
    text: `Hi ${contact.name},

I wanted to connect regarding website & app development services.

Let me know if you're interested.

Regards,
Digital Vibe`
  });

  console.log(`Sent to ${contact.email}`);
}

async function run() {
  const contacts = [];

  fs.createReadStream("contacts.csv")
    .pipe(csv())
    .on("data", (row) => {
      contacts.push(row);
    })
    .on("end", async () => {

      console.log(`Total contacts: ${contacts.length}`);

      // SAFE DAILY LIMIT
      const dailyLimit = 50; // increase slowly later

      const toSend = contacts.slice(0, dailyLimit);

      for (let contact of toSend) {
        await sendEmail(contact);
        await new Promise(r => setTimeout(r, delay()));
      }

      console.log("All emails sent safely!");
    });
}

run();