import { glob } from "glob";
import * as fs from "fs";
import * as path from "path";
import { SageProcessor } from "./sage-file-processor";
import { XLSProcessor } from "./process-xlsx";

const workingDirectory = path.resolve("./input");

const outputDirectory = path.resolve("./output");
if (!fs.existsSync(outputDirectory)){
  fs.mkdirSync(outputDirectory);
}

console.clear();
console.log(`Importing report files from ${workingDirectory}`);
const XlsFileNames = glob.sync(`${workingDirectory}/*.xlsx`);

XlsFileNames.forEach(fName => {
  XLSProcessor(fName);
});

const csvFileNames = glob.sync(`${workingDirectory}/*.csv`);
csvFileNames.forEach(fName => {
  SageProcessor(fName, "output");
});

