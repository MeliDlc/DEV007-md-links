import {
  existsPath,
  toAbsolute,
  isMdFile,
  findLinksInFile,
  dirToFile,
  validateLinks,
  getStats,
  statsValidate,
} from "./functions.js";

import chalk from "chalk";

export const mdLinks = (path, options) => {
  return new Promise((resolve, reject) => {
    // indetifica si la ruta exista
    if (!existsPath(path)) {
      reject(chalk.red("path does not exist")); // si no existe la ruta rechaza la promesa
      return;
    }
    const absolute = toAbsolute(path); // es absoluto? volver de relativo a absoluto
    // Es archivo? encuentra links si no recorre file y encuentra links
    const linksPromise = isMdFile(absolute)
      ? findLinksInFile(absolute)
      : dirToFile(absolute);

    linksPromise
      .then((links) => {
        if (options.validate) {
          return validateLinks(links, options);
        }
        return links;
      })
      .then((results) => {
        if (options.stats && options.validate) {
          const output = statsValidate(results);
          resolve(output);
        } else if (options.stats) {
          resolve(getStats(results));
        }
        return resolve(results);
      })
      .catch((error) => reject(error));
  });
};
