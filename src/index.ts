import { glob } from "glob";
import { SageProcessor } from "./process-sage";
import { XLSProcessor } from "./process-xlsx";

console.log("Is this thing working? IT IS");
const csvFileNames = glob.sync("input-files/*.csv");
const XlsFileNames = glob.sync("input-files/*.xlsx");

XlsFileNames.forEach(fName => {
  console.log(` ==> ${fName}`);
  XLSProcessor(fName);
});


csvFileNames.forEach(fName => {
  console.log(` ==> ${fName}`);
  SageProcessor(fName);
});
