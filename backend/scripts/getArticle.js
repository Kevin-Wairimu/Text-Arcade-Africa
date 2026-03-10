require("dotenv").config();
const mongoose = require("mongoose");
const Article = require("../models/Article");

async function getArticle() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error("❌ MONGO_URI not found in environment variables.");
      process.exit(1);
    }
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");

    const id = "69b0005c7671aed5130666ac";
    const article = await Article.findById(id).lean();

    if (!article) {
      console.log(`❌ Article with ID ${id} not found.`);
    } else {
      console.log("✅ Article found:");
      console.log(JSON.stringify(article, null, 2));
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

getArticle();
