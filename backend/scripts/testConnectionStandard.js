const mongoose = require("mongoose");

// Manual node addresses from the Atlas dashboard
const nodes = [
  'ac-fotkeoo-shard-00-00.xdz6sji.mongodb.net:27017',
  'ac-fotkeoo-shard-00-01.xdz6sji.mongodb.net:27017',
  'ac-fotkeoo-shard-00-02.xdz6sji.mongodb.net:27017'
];

// Use standard connection string (no srv)
const uri = `mongodb://Secondary:123456789%21@${nodes.join(',')}/?ssl=true&replicaSet=atlas-fotkeoo-shard-0&authSource=admin&appName=secondary`;

console.log("Connecting using standard (non-SRV) URI...");
console.log("URI (masked):", uri.replace(/:([^:@]+)@/, ":****@"));

const connect = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 20000
    });
    console.log("✅ SUCCESS! Connected via Standard URI.");
    console.log("📡 Host:", mongoose.connection.host);
    console.log("🗃️  Database:", mongoose.connection.name);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ FAILED:", err.message);
    process.exit(1);
  }
};

connect();
