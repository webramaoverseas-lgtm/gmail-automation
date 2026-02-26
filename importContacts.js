require("dotenv").config();
require("./db");

const csv = require("csv-parser");
const fs = require("fs");
const Contact = require("./models/Contact");

async function run() {
  const contacts = [];

  fs.createReadStream("contacts.csv")
    .pipe(csv())
    .on("data", (row) => contacts.push(row))
    .on("end", async () => {

      for (let contact of contacts) {
        try {
          await Contact.updateOne(
            { email: contact.email },
            { $setOnInsert: contact },
            { upsert: true }
          );
        } catch (err) {
          console.log("Duplicate skipped:", contact.email);
        }
      }

      console.log("Contacts Imported Successfully!");
      process.exit();
    });
}

run();