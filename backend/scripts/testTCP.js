const net = require('net');

const HOSTS = [
  'ac-fotkeoo-shard-00-00.xdz6sji.mongodb.net',
  'ac-fotkeoo-shard-00-01.xdz6sji.mongodb.net',
  'ac-fotkeoo-shard-00-02.xdz6sji.mongodb.net'
];
const PORT = 27017;

const testConnection = (host, port) => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(3000);

    socket.on('connect', () => {
      console.log(`✅ SUCCESS: Connected to ${host}:${port}`);
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      console.log(`❌ TIMEOUT: Could not connect to ${host}:${port} within 3 seconds.`);
      socket.destroy();
      resolve(false);
    });

    socket.on('error', (err) => {
      console.log(`❌ ERROR: Could not connect to ${host}:${port} - ${err.message}`);
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, host);
  });
};

const runAll = async () => {
  console.log("Testing TCP connectivity to port 27017 on Atlas Nodes...");
  for (const host of HOSTS) {
    await testConnection(host, PORT);
  }
  console.log("Finished.");
};

runAll();
