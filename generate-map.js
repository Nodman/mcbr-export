#!/usr/bin/env node

const util = require("util");
const fs = require("fs");
const path = require("path");
const exec = require("child_process").exec;

const { createLogger, printStdout } = require("./utils");

const MC_VOLUME = "mc-volume";
const WORLD_NAME = "SeekingDiamonds";
const BR_VIZ = "bedrock-viz";

const WWW_FOLDER = path.resolve(__dirname, "./www/map");
const TEMP_FOLDER = path.resolve(__dirname, "./temp");
const DOCKER_CP = path.resolve(__dirname, "./scripts/docker-cp");

const COMMANDS = {
  GENERATE: `${BR_VIZ} --db ${TEMP_FOLDER}/${WORLD_NAME} --out ${WWW_FOLDER} --html-most`,
  CLEAN: `rm -rf ${TEMP_FOLDER}`,
  BACKUP: `${DOCKER_CP} ${MC_VOLUME}:/worlds ${TEMP_FOLDER}`,
};

const execAsync = util.promisify(exec);
const log = createLogger("[MAP GEN]");

async function generateMap() {
  const startTime = Date.now();

  log("remove old data");
  await execAsync(COMMANDS.CLEAN);

  log("backup current data");
  await execAsync(COMMANDS.BACKUP).then(printStdout);
  try {
    log("generate new map");
    await execAsync(COMMANDS.GENERATE).then(printStdout);
  } catch (err) {
    console.error(err.stdout);
    throw err;
  }

  const timeDelta = Date.now() - startTime;

  log(`finished in ${timeDelta / 1000} s.`);

  return timeDelta;
}

module.exports = generateMap;
