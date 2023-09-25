#!/usr/bin/env node

const packageJson = require("../package.json");
const { program } = require("commander");
const initYaml = require("../dist/index.cjs").default;

program.version(packageJson.version).description(packageJson.description);

program
   .option("-c, --config <configFile>", "Specify the config file path, default: /yaml-tempfile/config.yaml ")

program.parse(process.argv);

const options = program.opts();
let configFile = options.config;
let configPath = "/";
if (!configFile) configFile = "/yaml-tempfile/config.yaml";
if (configFile.indexOf("/") > -1) configPath = configFile.substring(0, configFile.lastIndexOf("/"));

initYaml(configPath, configFile);