require("dotenv").config();
const mongoose = require("mongoose");
const Contact = require("./models/Contact");

async function seedTest() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const email = "kartikeya.raj29@gmail.com";
    await Contact.deleteMany({ email }); // Ensure fresh start for this email

    await Contact.create({
      name: "Kartikeya Raj",
      email: email,
      stage: "new"
    });

    console.log(`Seeded test contact: ${email}. Ready for 'Launch'!`);

  } catch (err) {
    console.error("Seeding Error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

seedTest();
