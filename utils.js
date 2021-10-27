const formatDate = (
  value,
  locales = "en-gb",
  options = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZone: "Europe/Kiev",
  }
) => {
  const date = new Date(value);
  return date.toLocaleDateString(locales, options);
};

const createLogger = (prefix = "") => {
  return (message, ...rest) => {
    console.log(`${prefix}[${formatDate(Date.now())}] ${message}`, ...rest);
  };
};

const printStdout = ({ stdout }) => {
  console.log(stdout);
};

module.exports = {
  formatDate,
  createLogger,
  printStdout,
};
