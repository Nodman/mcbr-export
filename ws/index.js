const { createLogger } = require("../utils");

const wss = require("./wss");
const { resolveGenerate, getState } = require("./resolveGenerate");

const PING_INTERVAL = 30000;

const log = createLogger("[WS]");

function heartbeat() {
  this.isAlive = true;
}

const pingIntervalId = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping();
  });
}, PING_INTERVAL);

wss.on("connection", function connection(ws, req) {
  log("connected: %s", req.socket.remoteAddress);

  ws.isAlive = true;

  ws.on("pong", heartbeat);
  ws.on("message", function incoming(message) {
    const messageString = message.toString();

    log("%s <= %s", req.socket.remoteAddress, messageString);

    switch (messageString) {
      case "generate":
        return resolveGenerate(ws, req);
      default:
        return;
    }
  });

  ws.send(JSON.stringify(getState()));
});

wss.on("close", function close() {
  clearInterval(pingIntervalId);
});
