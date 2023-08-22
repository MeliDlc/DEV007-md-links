import { mdLinks } from "../index.js";
import {
  directory,
  markdownFile,
  isMdFile,
  existsPath,
  toAbsolute,
  findLinksInFile,
  dirToFile,
  validateLinks,
  getStats,
  statsValidate,
} from "../functions.js";
import chalk from "chalk";

describe("mdLinks", () => {

  it('should return a promise', () => {
    expect(mdLinks("./file/example2.md", { options: true})).toBeInstanceOf(Promise);
  });

  it("should return an array of links without validation", () => {
    const output = [
      {
        file: "C:\\Users\\MELISSA\\OneDrive\\Escritorio\\DEV007-md-links\\file\\example2.md",
        href: "http://nodejs.org/",
        text: "Node.js",
      },
      {
        file: "C:\\Users\\MELISSA\\OneDrive\\Escritorio\\DEV007-md-links\\file\\example2.md",
        href: "http://dsca4145..evelopers.google.com/v8/",
        text: "V8",
      },
      {
        file: "C:\\Users\\MELISSA\\OneDrive\\Escritorio\\DEV007-md-links\\file\\example2.md",
        href: "http:///develo..pgle.com/v8/",
        text: "Broken",
      },
    ];
    return mdLinks("./file/example2.md", { validate: false }).then((links) => {
      expect(links).toEqual(output);
    });
  });

  it("should return an array of links with validation", () => {
    const output = [
      {
        file: "C:\\Users\\MELISSA\\OneDrive\\Escritorio\\DEV007-md-links\\file\\example2.md",
        href: "http://nodejs.org/",
        text: "Node.js",
        status: 200,
        message: "ok",
      },
      {
        file: "C:\\Users\\MELISSA\\OneDrive\\Escritorio\\DEV007-md-links\\file\\example2.md",
        href: "http://dsca4145..evelopers.google.com/v8/",
        text: "V8",
        status: "404",
        message: "fail",
      },
      {
        file: "C:\\Users\\MELISSA\\OneDrive\\Escritorio\\DEV007-md-links\\file\\example2.md",
        href: "http:///develo..pgle.com/v8/",
        text: "Broken",
        status: "404",
        message: "fail",
      },
    ];
    return mdLinks("./file/example2.md", { validate: true }).then((links) => {
      expect(links).toStrictEqual(output);
    });
  });

  it('should return statistics with --stats option', () => {
    const output = { total: 3, unique: 3 };
    return mdLinks('./file/example2.md', { stats: true }).then((stats) => {
      expect(stats).toEqual(output);
    });
  });

  it('should return statistics with --stats and --validate option', () => {
    const output = { total: 3, unique: 3, broken: 2 };
    return mdLinks('./file/example2.md', { stats: true, validate: true }).then((results) => {
      expect(results).toEqual(output);
    });
  });

  it("should reject when a path does not exist", () => {
    return mdLinks("/ale/css/nonexistant.d").catch((error) => {
      expect(error).toBe(chalk.red("path does not exist"));
    });
  });

});

describe("Path tests", () => {
  it("should return true if the path exists", () => {
    expect(existsPath("./file")).toBe(true);
  });

  it("should return false if the path does not exist", () => {
    expect(existsPath("/ale/css/nonexistant.d")).toBe(false);
  });

  it("should return an absolute path", () => {
    expect(toAbsolute("./file/example2.md")).toBe(
      "C:\\Users\\MELISSA\\OneDrive\\Escritorio\\DEV007-md-links\\file\\example2.md"
    );
  });
});

describe("Folder tests", () => {
  it("should return true if the path is a directory", () => {
    expect(directory("./file")).toBe(true);
  });

  it("should return false if the path is a file", () => {
    expect(directory("./file/example2.md")).toBe(false);
  });

  it("dirToFile should return an array of links from all files in the directory", async () => {
    const output = [
      {
        file: "file2\\file3\\test.md",
        href: "http://es.wikipedia.org/wiki/Markdown",
        text: "Markdown",
      },
    ];
    const links = await dirToFile("./file2");
    expect(links).toEqual(output);
  });

  /* it("dirToFile should reject when a folder can't be read", () => {
    return(dirToFile("./file2")).catch((error) => {
      expect(error).toContain('Error processing directory');
    })
  });  */
});

describe("file tests", () => {
  it("findLinksInFile should return an array of links", () => {
    const output = [
      {
        file: "./file2/file3/test.md",
        href: "http://es.wikipedia.org/wiki/Markdown",
        text: "Markdown",
      },
    ];
    return findLinksInFile("./file2/file3/test.md").then((links) => {
      expect(links).toEqual(output);
    });
  });

  it("should reject when a file can't be read", () => {
    return findLinksInFile("./meli/css/nonexistant.md").catch((error) => {
      expect(error).toContain("couldn't be read");
    });
  });
});

describe("Markdown file tests", () => {
  it("should return true if the path is a MdFile", () => {
    expect(markdownFile("./file/example2.md")).toBe(true);
  });

  it("should return false if the path not a file and not a MdFile", () => {
    expect(isMdFile("./file2/test.txt")).toBe(false);
  });
});

describe("validateLinks", () => {
  it("should validate links that work", () => {
    const links = [
      {
        file: "./file2/file3/test.md",
        href: "http://es.wikipedia.org/wiki/Markdown",
        text: "Markdow",
        status: 200,
        message: "ok",
      },
    ];

    return validateLinks(links, { validate: true }).then((result) => {
      expect(result).toEqual(links);
    });
  });

  it("should skip validation if options.validate is false", async () => {
    const links = "./file2/file3/test.md";
    const options = { validate: false };
    const validatedLinks = await validateLinks(
      "./file2/file3/test.md",
      options
    );
    expect(validatedLinks).toBe(links);
  });
});

describe("Command tests", () => {
  it("should return total and unique links in a md file", () => {
    const links = [
      {
        file: "./file/example2.md",
        href: "http://nodejs.org/",
        text: "Node.js",
        status: 200,
        message: "ok",
      },
      {
        file: "./file/example2.md",
        href: "http://dsca4145..evelopers.google.com/v8/",
        text: "V8",
        status: 404,
        message: "fail",
      },
      {
        file: "./file/example2.md",
        href: "http:///develo..pgle.com/v8/",
        text: "Broken",
        status: 404,
        message: "fail",
      },
    ];
    expect(getStats(links)).toEqual({ total: 3, unique: 3 });
  });

  it("should return total, unique and broken links in a md file", () => {
    const links = [
      {
        file: "./file/example2.md",
        href: "http://nodejs.org/",
        text: "Node.js",
        status: 200,
        message: "ok",
      },
      {
        file: "./file/example2.md",
        href: "http://dsca4145..evelopers.google.com/v8/",
        text: "V8",
        status: 404,
        message: "fail",
      },
      {
        file: "./file/example2.md",
        href: "http:///develo..pgle.com/v8/",
        text: "Broken",
        status: 404,
        message: "fail",
      },
    ];
    expect(statsValidate(links)).toEqual({ total: 3, unique: 3, broken: 2 });
  });
});
