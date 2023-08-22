import { existsSync, statSync, readFile, readdirSync } from "fs";
import { isAbsolute, resolve, extname, join } from "path";
import fetch from "node-fetch";
import chalk from "chalk";

export const existsPath = (path) => existsSync(path);

export const toAbsolute = (path) => {
  return isAbsolute(path) ? path : resolve(path);
};

// verifica si es un directorio. statSync returns information about a path
export const directory = (absolutePath) => statSync(absolutePath).isDirectory();

// to check if its a md file
export const markdownFile = (path) => extname(path) === ".md";

export const joinPath = (absolute, file) => join(absolute, file);

export const findLinksInFile = (absolute) => {
  // hay que hacer una promesa porque retornamos un valor
  return new Promise((resolve, reject) => {
    // tenemos que leer el archivo md
    readFile(absolute, "utf-8", (error, fileContent) => {
      if (error) {
        reject(chalk.red(`${error} , ${fileContent} couldn't be read `));
        return;
      }

      const fileLinks = [];
      const linkRegex = /\[([^\]]+)\]\(([^\)]+)\)/g;
      // hacemos match con el metodo matchAll()
      const matches = fileContent.matchAll(linkRegex);
      // llenamos el objeto con las propiedades usando for de los matches
      for (const match of matches) {
        const text = match[1];
        const href = match[2];
        const link = {
          href,
          text,
          file: absolute,
        };
        fileLinks.push(link); // los metemos al array links
      }

      resolve(fileLinks);
    });
  });
};

export const isMdFile = (filePath) => {
  return statSync(filePath).isFile() && markdownFile(filePath);
};

export const dirToFile = (dirPath) => {
  const files = readdirSync(dirPath);

  const filePromises = files.map((file) => {
    const filePath = join(dirPath, file);

    if (isMdFile(filePath)) {
      return findLinksInFile(filePath);
    }

    if (directory(filePath)) {
      return dirToFile(filePath);
    }

    return [];
  });

  return Promise.all(filePromises)
    .then((results) => results.flat()) // flat para obtener un solo array con todos los links del dir
    .catch((error) => {
      throw new Error(`Error processing directory: ${dirPath}\n${error}`);
    });
};

export const validateLinks = (links, options) => {
  return new Promise((resolve, reject) => {
    if (options.validate) {
      const linkPromises = links.map((link) => {
        return fetch(link.href)
          .then((response) => {
            link.status = response.status;
            link.message = response.ok ? "ok" : "fail";

            return link;
          })
          .catch(() => {
            link.status = "404";
            link.message = "fail";
            return link;
          });
      });

      Promise.all(linkPromises)
        .then((validatedLinks) => resolve(validatedLinks))
        .catch((error) => reject(error));
    } else {
      resolve(links);
    }
  });
};

const countUniqueLinks = (links) => {  
  // set object to store href values of each link
  const uniqueLinks = new Set(links.map((link) => link.href));
  // size property to know the # of elements in the set
  return uniqueLinks.size;
};

const countBrokenLinks = (links) => {
  // filter to create a new array with fail messages
  const brokenLinks = links.filter((link) => link.message === "fail");
  return brokenLinks.length;
};

export const getStats = (links) => {
  const total = links.length;
  const unique = countUniqueLinks(links);
  return {total: total , unique: unique};
};

export const statsValidate = (links) => {
  const total = links.length;
  const unique = countUniqueLinks(links);
  const broken = countBrokenLinks(links);
  return {total, unique, broken};
};
