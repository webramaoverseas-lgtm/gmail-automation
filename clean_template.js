const fs = require("fs");
const path = require("path");

const html = fs.readFileSync("last_fetched_template.html", "utf-8");

// The actual content starts after the forwarded message line
// We can find the first <div> with class starting with "msg" or just search for the start of the actual body
const startMarker = '<div class="msg';
const startIndex = html.indexOf(startMarker);

if (startIndex === -1) {
    console.error("Could not find start of template content.");
    process.exit(1);
}

// Find the last closing div of the gmail quote container if it exists
// or just find the end of the content
// Given the structure, the content we want is inside the gmail_quote div
const content = html.substring(startIndex);

// Clean up some Google/Gmail artifacts if possible
// The class msgXXXXXXXX is specific to that email, so let's keep it but maybe generalize or just use as is.
// Actually, let's just save this as the new Welcome template.

fs.writeFileSync("cleaned_welcome_template.html", content);
console.log("✅ Cleaned template saved to cleaned_welcome_template.html");
