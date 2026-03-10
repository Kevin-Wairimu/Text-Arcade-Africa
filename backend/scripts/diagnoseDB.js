require("dotenv").config();
const mongoose = require("mongoose");

async function diagnose() {
  try {
    console.log("Connecting to:", process.env.MONGO_URI.replace(/:([^:@]+)@/, ":****@"));
    await mongoose.connect(process.env.MONGO_URI);
    
    const db = mongoose.connection.db;
    console.log("✅ Connected to DB:", db.databaseName);

    const collections = await db.listCollections().toArray();
    console.log("\nCollections:");
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`- ${col.name}: ${count} documents`);
    }

    if (collections.some(c => c.name === 'articles')) {
        const articles = await db.collection('articles').find({}).toArray();
        console.log("\nArticles Detail:");
        articles.forEach(a => {
            console.log(`- [${a.category}] ${a.title}`);
        });
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

diagnose();
