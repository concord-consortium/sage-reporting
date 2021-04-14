import { ProcessCSVData } from "./process-sage"
import * as fs from "fs";

export const SageProcessor = async (fileName: string, outDir:string) => {
  console.log(`SageProcessor processing: ${fileName}`);
  const content:Buffer|string = await fs.readFileSync(fileName);
  const csvString = await ProcessCSVData(content);
  const lastPartOfFile = fileName.split('\\').pop().split('/').pop();
  const outPath = `${outDir}/${lastPartOfFile}`;
  console.log(`Writing final output file: → ${outPath}`);
  await fs.writeFileSync(outPath, csvString);
};
