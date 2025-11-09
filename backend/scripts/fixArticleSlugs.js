const mongoose = require("mongoose");
const slugify = require("slugify");
const Article = require("./models/Article"); // adjust path

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

(async () => {
  const articles = await Article.find({ slug: { $exists: false } });
  for (const article of articles) {
    article.slug = slugify(article.title, { lower: true, strict: true });
    await article.save();
    console.log("Updated slug for:", article.title, "->", article.slug);
  }
  console.log("All missing slugs updated!");
  mongoose.disconnect();
})();
