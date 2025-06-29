const net = require('net');

async function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => resolve(false));
      server.close();
    });
    server.on('error', () => resolve(true));
  });
}

async function checkPorts() {
  const ports = [5000, 5173, 3000, 8080];
  
  for (const port of ports) {
    const inUse = await checkPort(port);
    console.log(`Port ${port}: ${inUse ? '🔴 In Use' : '🟢 Available'}`);
  }
}

checkPorts();
