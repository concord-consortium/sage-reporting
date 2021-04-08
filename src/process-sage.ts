import * as parse from "csv-parse/lib/sync";
import * as fs from "fs";
import * as base64 from "base-64";
import fetch from "node-fetch";

// To reshape the CSV file will have to:
// * First pass:
// ** Identify columns that have sage models answers.
// ** append new columns and cells to each records.

// Loading data from the docstore:
// https://github.com/concord-consortium/cloud-file-manager/blob/8757ff5f55de7155cc4aaeac9aafb2938d1b8159/src/code/providers/lara-provider.js#L123

// @see: https://github.com/concord-consortium/cloud-file-manager/blob/8757ff5f55de7155cc4aaeac9aafb2938d1b8159/src/code/providers/document-store-url.js#L64
// const v2DocumentUrl = (id:string, params?:Record<string,string>) => {
//   const url = `//document-store.concord.org/v2/documents/${id}`;
//   if (!params) { return url }
//   const kvp = []
//   for (let key in params) {
//     const value = params[key]
//     kvp.push([key, value].map(encodeURI).join("="))
//   }
//   return url + "?" + kvp.join("&")
// }
const v2DocumentUrl = (docId:string, key:string) => {
  const base = `https://document-store.concord.org/v2/documents`;
  const keyParam = `accessKey=RO::${key}`;
  return `${base}/${docId}?${keyParam}`;
}

const fetchDocStoreData = async (docId:string, key:string) => {
  const url = v2DocumentUrl(docId,key);
    // Default options are marked with *
    const response = await fetch(url, {
      // method: 'GET', // *GET, POST, PUT, DELETE, etc.
      // mode: 'cors', // no-cors, *cors, same-origin
      // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      // credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        // 'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
    });
    return response.json() // parses JSON response into native JavaScript objects
}

const LaraLaunchKeyRegex =/launchFromLara=([^/&=",])+/;

const processReponseItem = (item: any) => {
  // TODO: Which one do we want?
  console.log(item.components[0].componentStorage.savedGameState.topology);
}
const processRecord = (record: Record<string,any>) =>{
  Object.keys(record).forEach( (key) => {
    const value = record[key];
    if (typeof(value) == 'string') {
      if(LaraLaunchKeyRegex.test(value)) {
        const matches = value.match(LaraLaunchKeyRegex);
        const [paramKey,paramVal] = matches[0].split("=")
        if(paramVal) {
          try {
            const decodedParams = JSON.parse(base64.decode(paramVal));
            const {recordid, accessKeys: {readOnly}} = decodedParams;
            fetchDocStoreData(recordid, readOnly)
              .then((response) => processReponseItem(response))
              .catch(e => console.error(e))
          }
          catch(e) {
            // console.log(e);
            // console.log(paramVal);
            // console.log(base64.decode(paramVal.replace("/","")));
          }
        }
      }
    }
  })
}
// look for the access key
export const SageProcessor = async (fileName: string) => {
  console.log(`SageProcessor processing: ${fileName}`);
  const content = await fs.readFileSync(fileName);
  const records = parse(content, {columns: true});
  records.map(processRecord)
};