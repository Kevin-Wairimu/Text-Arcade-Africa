require("dotenv").config();
const mongoose = require("mongoose");
const Article = require("../models/Article");

async function fixLabels() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error("❌ MONGO_URI not found in .env file");
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");

    const oldString = "Editorial Media Asset";
    const newString = "CEO of NMG Uganda Susan Nsiribwa";

    // Find all articles where the content contains the old string
    const articles = await Article.find({ content: { $regex: oldString } });
    console.log(`🔍 Found ${articles.length} articles containing "${oldString}"`);

    for (let article of articles) {
      // Use a global regex to replace all occurrences in the content
      const updatedContent = article.content.replace(new RegExp(oldString, 'g'), newString);
      article.content = updatedContent;
      
      // Also check imageLabels map if it exists
      if (article.imageLabels) {
        for (let [key, value] of article.imageLabels.entries()) {
          if (value === oldString) {
            article.imageLabels.set(key, newString);
          }
        }
      }

      await article.save();
      console.log(`✅ Updated article: ${article.title}`);
    }

    console.log("✨ All labels updated successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

fixLabels();
