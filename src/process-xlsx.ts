// https://www.npmjs.com/package/xlsx
import * as XLSX from 'xlsx';

// Related Stack Overflow: https://stackoverflow.com/questions/34342425/convert-xls-to-csv-on-the-server-in-node

export const XLSProcessor = (fileName: string) => {
  console.log(`XLSProcessor processing: ${fileName}`);
  const workBook = XLSX.readFile(fileName);
  const outputFileName = fileName.replace(/\.xlsx/i, ".csv");
  XLSX.writeFile(workBook, outputFileName, { bookType: "csv" });
};