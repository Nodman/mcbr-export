const generateButtonNode = document.querySelector("#generate");
const stateNode = document.querySelector("#state");

const STATUSES = {
  BUSY: 'BUSY',
  FINISHED: 'FINISHED',
  ERROR: 'ERROR'
}

const MAX_RETRIES = 1;

let socket
let retries = 0;

const connectWS = () => {
  socket = new WebSocket(`ws://${location.hostname}:8080`);

  socket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    const { updatedAt, timeSpent } = data;

    let stateText = updatedAt

    switch (data.status) {
      case STATUSES.BUSY:
        generateButtonNode.disabled = true;
        stateText = 'in progress...'
        break;
      case STATUSES.FINISHED:
        generateButtonNode.disabled = false;
        break;
      case STATUSES.ERROR:
        stateNode.textContent = 'something went wrong :(';
        generateButtonNode.disabled = true;
        break;
      default:
        return;
    }

    if (timeSpent) {
      stateText += ` and it took: ${timeSpent / 1000}s.`
    }

    stateNode.textContent = stateText;
  };

  socket.onerror = function (...args) {
    console.log(args);
    stateNode.textContent = "Unable to connect";
    socket.close();

    if (retries < MAX_RETRIES) {
      retries += 1
      connectWS();
    }
  };
};

const onGenerateClick = () => {
  socket.send("generate");
};

generateButtonNode.addEventListener("click", onGenerateClick);

connectWS();
