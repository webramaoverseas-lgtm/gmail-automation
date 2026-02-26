require("dotenv").config();
const mongoose = require("mongoose");
const Template = require("./models/Template");

async function seed() {
  try {
    console.log("Connecting to Mongo...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected.");

    await Template.deleteMany({});
    console.log("Cleared old templates.");

    const defaults = [
      { 
        name: "Welcome", 
        order: 0, 
        delayDays: 0, 
        subject: "Quick question for you, {{name}}", 
        htmlBody: `
          <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333;">
            <p>Hi {{name}},</p>
            <p>I noticed your brand online and was really impressed with your current presence. However, I think there's a huge opportunity you might be missing to turn more of your visitors into customers.</p>
            <p>At <strong>Digital Vibe</strong>, we specialize in building high-conversion websites and apps that don't just look pretty—they drive revenue.</p>
            <p>Would you be open to a 5-minute chat about how we can help you scale this year?</p>
            <p>Best,<br>The Digital Vibe Team</p>
          </div>
        ` 
      },
      { 
        name: "Re-engagement", 
        order: 1, 
        delayDays: 3, 
        subject: "Did you see my last email, {{name}}?", 
        htmlBody: `
          <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333;">
            <p>Hey {{name}},</p>
            <p>I know things get busy, so I'm just sliding this back to the top of your inbox.</p>
            <p>I genuinely believe we could help you double your conversion rate with a few simple tweaks to your tech stack.</p>
            <p>No pressure, but if you're interested in seeing some of our recent case studies, just hit reply!</p>
            <p>Cheers,<br>Digital Vibe Outreach</p>
          </div>
        ` 
      },
      { 
        name: "Conversion", 
        order: 2, 
        delayDays: 3, 
        subject: "Exclusive Strategy for {{name}}", 
        htmlBody: `
          <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333;">
            <p>Hi {{name}},</p>
            <p>Great to see you're still interested! Since you took the time to read my previous emails, I wanted to offer you something special.</p>
            <p>I've put together a <strong>free 15-minute audit</strong> specifically for your brand. We'll show you exactly where you're losing money and how to fix it.</p>
            <p>Reply with "YES" to book your session, or use this link: [Your Calendly Link]</p>
            <p>Let's make it happen!<br>Digital Vibe Success Team</p>
          </div>
        ` 
      },
      { 
        name: "Limited Time Offer", 
        order: 3, 
        delayDays: 3, 
        subject: "Last Chance: 50% Off Development for {{name}}", 
        htmlBody: `
          <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333;">
            <p>Hi {{name}},</p>
            <p>This will be my final email regarding this specific offer.</p>
            <p>We're looking to take on one more high-growth partner this month, and to make the decision easy, we're offering <strong>50% off</strong> our standard development fee if you sign up in the next 48 hours.</p>
            <p>If you want to scale your business for half the cost, this is your sign.</p>
            <p>Last call,<br>Digital Vibe Founder</p>
          </div>
        ` 
      }
    ];

    await Template.insertMany(defaults);
    console.log("Success! 4 templates inserted.");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

seed();
