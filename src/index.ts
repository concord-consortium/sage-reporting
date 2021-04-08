import { glob } from "glob";
import * as fs from "fs";
import * as path from "path";
import { SageProcessor } from "./process-sage";
import { XLSProcessor } from "./process-xlsx";

const workingDirectory = path.resolve("./input");

const outputDirectory = path.resolve("./output");
if (!fs.existsSync(outputDirectory)){
  fs.mkdirSync(outputDirectory);
}

console.clear();
console.log(`Working with files in ${workingDirectory}`);
const csvFileNames = glob.sync(`${workingDirectory}/*.csv`);
const XlsFileNames = glob.sync(`${workingDirectory}/*.xlsx`);

XlsFileNames.forEach(fName => {
  console.log(` ==> ${fName}`);
  console.log(fName);
  XLSProcessor(fName);
});

csvFileNames.forEach(fName => {
  console.log(` ==> ${fName}`);
  SageProcessor(fName, "output");
});

