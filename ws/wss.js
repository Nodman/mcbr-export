const WebSocket = require("ws");

const PORT = 8080;

const wss = new WebSocket.WebSocketServer({ port: PORT });

module.exports = wss;
