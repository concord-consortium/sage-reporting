// https://www.npmjs.com/package/xlsx
import { fstat } from 'node:fs';
import * as XLSX from 'xlsx';
// import * as fs from 'fs';
// Related Stack Overflow: https://stackoverflow.com/questions/34342425/convert-xls-to-csv-on-the-server-in-node

export const XLSProcessor = (fileName: string) => {
  console.log(`XLSProcessor processing: ${fileName}`);
  const workBook = XLSX.readFile(fileName);
  const outputFileName = fileName.replace(/\.xlsx/i, ".csv");
  // const csvString = XLSX.utils.sheet_to_csv(workBook,{forceQuotes: true})
  // fs.writeFileSync(outputFileName, csvString);
  XLSX.writeFile(workBook, outputFileName, { bookType: "csv"});
};