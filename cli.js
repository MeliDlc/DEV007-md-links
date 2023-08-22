#!/usr/bin/env node

// to indicate that we use this file as a cli script
// const { mdLinks } = require("./index.js").default;
import chalk from "chalk";
import { mdLinks } from "./index.js";
import { argv } from "process";

// [0 -node, 1-script, 2-ruta, 3 o 4 ya --validate o --stats]
const args = argv.slice(2);
const path = args[0];
const options = {
  validate: args.includes("--validate"),
  stats: args.includes("--stats"),
};

if (args.includes("--help")) {
  console.log("mdLinks - A tool to analyze Markdown files and extract links.");
  console.log("Usage: mdLinks <path> [options]");
  console.log("");
  console.log("Options:");
  console.log("--validate   Validate the status of each link.");
  console.log("--stats      Display statistics about the links.");
  console.log("--help       Display help information.");
} else {
  mdLinks(path, options)
    .then((results) => {
      if (options.stats && options.validate) {
        const statsValidateText = `
      ${chalk.bgBlue.white(" Total ")}: ${results.total}\n
      ${chalk.bgGreen.white(" Unique ")}: ${results.unique}\n
      ${chalk.bgRed.white(" Broken ")}: ${results.broken}
      `;
        console.log(statsValidateText);
      } else if (options.stats) {
        const statsText = `
      ${chalk.bgBlue.white(" Total ")}: ${results.total}\n
      ${chalk.bgGreen.white(" Unique ")}: ${results.unique}\n
      `;
        console.log(statsText);
      } else {
        results.forEach((link) => {
          console.log(formatLinkOutput(link, options.validate));
        });
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

const formatLinkOutput = (link, validate) => {
  let output = `${chalk.grey.bold(link.file)} ${chalk.cyan(link.href)} ${chalk.white(link.text)} `;
  if (validate) {
    output += ` ${
      link.message === "ok"
        ? chalk.bgGreen.bold(" OK ✔ ")
        : chalk.bgRed.bold(" FAIL ✖ ")
    }`;
    output += ` ${chalk.yellow(link.status)} `;
  }
  if (link.text.length > 50) {
    output += ` 
    ${chalk.gray(link.text.slice(0, 50) + "...")}\n
    ${chalk.bgGreen.white(link.href)}: ${unique}`;
  }
  return output;
};
