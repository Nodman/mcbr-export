const WebSocket = require("ws");

const generateMap = require("../generate-map");
const { formatDate, createLogger } = require("../utils");

const wss = require("./wss");

let generatePromise;

const log = createLogger('[WS]');

const STATUSES = {
  BUSY: 'BUSY',
  FINISHED: 'FINISHED',
  ERROR: 'ERROR'
}

const state = {
  updatedAt: "unknown",
  timeSpent: null,
  status: STATUSES.FINISHED,
};

const getState = () => {
  return state;
};

const setState = (nextState) => {
  Object.assign(state, nextState);
};

const createFromStateMessage = () => {
  return JSON.stringify(getState())
}

const resolveGenerate = (ws, req) => {
  const { remoteAddress } = req.socket;

  if (getState().status === STATUSES.BUSY) {
    log("%s => busy", remoteAddress);
    ws.send(createFromStateMessage());
  } else {
    log("%s => started", remoteAddress);
    setState({ status: STATUSES.BUSY, timeSpent: null })
    ws.send(createFromStateMessage());

    try {
      generatePromise = generateMap();

      generatePromise.then((timeSpent) => {
        const updatedAt = formatDate(Date.now());

        setState({ timeSpent, updatedAt, status: STATUSES.FINISHED })

        generatePromise = undefined;

        const message = createFromStateMessage();

        wss.clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      });
    } catch (err) {
      setState({ status: STATUSES.ERROR, timeSpent: null })
      console.error(err)
      ws.send(createFromStateMessage());
    }
  }
};

module.exports = {
  resolveGenerate,
  getState,
};
