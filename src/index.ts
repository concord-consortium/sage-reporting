import { glob } from "glob";
import * as fs from "fs";
import * as path from "path";
import { XSLtoCSV } from "./process-xlsx";
import { ProcessCSVData, SuccessCount, FailCount } from "./process-sage";

const workingDirectory = path.resolve("./input");

const outputDirectory = path.resolve("./output");
if (!fs.existsSync(outputDirectory)){
  fs.mkdirSync(outputDirectory);
}

console.clear();
const XlsFileNames = glob.sync(`${workingDirectory}/*.xlsx`);
const numFiles = XlsFileNames.length;
console.log(`Importing report ${numFiles} files from ${workingDirectory}`);
XlsFileNames.forEach(async (fName) => {
  console.log(`1: Reading XLSX file: ${fName}`);
  const byteArray = fs.readFileSync(fName);
  const csv = XSLtoCSV(byteArray);
  const csvWithTopo = await ProcessCSVData(csv);
  console.log(`2: Parsing complete: [${SuccessCount}✔|${FailCount}✖]`)
  const lastPartOfFile = fName.split('\\').pop().split('/').pop();
  const outPath = `${outputDirectory}/${lastPartOfFile.replace(/\.xlsx?/i, '.csv')}`;
  console.log(`3: writing CSV output file: → ${outPath}`);
  fs.writeFileSync(outPath, csvWithTopo);
});
