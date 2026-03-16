const fs = require("fs");
const path = require("path");

const serverPath = path.join(__dirname, "server.js");
const newHtml = fs.readFileSync("cleaned_welcome_template.html", "utf-8");

// Personalize the new HTML
const personalizedHtml = newHtml.replace(
    '<strong>Your Collection Looks Premium,</strong>',
    '<p>Hi {{name}},</p><p><strong>Your Collection Looks Premium,</strong></p>'
);

let serverContent = fs.readFileSync(serverPath, "utf-8");

// We want to replace the entire 'defaults' array or at least the 'Welcome' entry
// To be safe and clean, I'll find the Welcome object in the defaults array and replace its htmlBody and subject.
const welcomeRegex = /\{\s*name:\s*"Welcome"[\s\S]*?subject:\s*".*?"[\s\S]*?htmlBody:\s*`[\s\S]*?`[\s\S]*?\}/;

const newWelcomeEntry = `{ 
      name: "Welcome", 
      order: 0, 
      delayDays: 0, 
      subject: "Your Brand Looks Premium", 
      htmlBody: \`${personalizedHtml.replace(/`/g, '\\`').replace(/\$\{/g, '\\${')}\`
    }`;

serverContent = serverContent.replace(welcomeRegex, newWelcomeEntry);

fs.writeFileSync(serverPath, serverContent);
console.log("✅ server.js updated with new Welcome template.");
