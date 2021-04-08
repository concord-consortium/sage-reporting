import * as parse from "csv-parse/lib/sync";
import * as stringify from "csv-stringify/lib/sync";
import * as fs from "fs";
import * as base64 from "base-64";
import fetch from "node-fetch";
import {ITopoReport} from "./topology-tagger";
import { indexOf } from "lodash";

// To reshape the CSV file will have to:
// * First pass:
// ** Identify columns that have sage models answers.
// ** append new columns and cells to each records.

// Loading data from the docstore:
// https://github.com/concord-consortium/cloud-file-manager/blob/8757ff5f55de7155cc4aaeac9aafb2938d1b8159/src/code/providers/lara-provider.js#L123

// @see: https://github.com/concord-consortium/cloud-file-manager/blob/8757ff5f55de7155cc4aaeac9aafb2938d1b8159/src/code/providers/document-store-url.js#L64
const v2DocumentUrl = (docId:string, key:string) => {
  const base = `https://document-store.concord.org/v2/documents`;
  const keyParam = `accessKey=RO::${key}`;
  return `${base}/${docId}?${keyParam}`;
}

const fetchDocStoreData = async (docId:string, key:string) => {
  const url = v2DocumentUrl(docId,key);
  const response = await fetch(url, {
    redirect: 'follow', // manual, *follow, error
  });
  if (!response.ok) {
    console.log("=======================================")
    console.log("Failed to fetch: ")
    console.log(response.text);
    console.log(response.status);
    console.log(response.statusText);
    console.log("=======================================")
  }
  return response.json() // parses JSON response into native JavaScript objects
}

const LaraLaunchKeyRegex =/launchFromLara=([^/&=",])+/;

type topoKey = "links" |  "nodes" | "unconnectedNodes" | "collectorNodes" |
  "multiLinkTargetNodes"|  "graphs"| "linearGraphs"| "feedbackGraphs"|
  "branchedGraphs"| "multiPathGraphs";

const topologyKeys = ["links",  "nodes",  "unconnectedNodes", "collectorNodes",
  "multiLinkTargetNodes",  "graphs", "linearGraphs", "feedbackGraphs",
  "branchedGraphs", "multiPathGraphs"];

type ITopology = Record<topoKey, number>;

interface ILink {
  in: INode,
  out: INode,
  title: string,
  label: string
}
interface INode {
  x: number,
  y: number,
  links: Array<ILink>
}
interface ICodapSageModelPartial {
  componentStorage: {
    name: string,
    savedGameState: {
      nodes: Array<INode>,
      links: Array<ILink>,
      topology?: ITopology
    }
  }
}

const processCodapItem = (key:string, item: any) => {
  let topology: any = {}
  item.components.forEach( (comp:ICodapSageModelPartial) => {
    if(comp.componentStorage?.savedGameState?.topology) {
      topology = comp.componentStorage.savedGameState.topology;
    }
  });
  return topology;
}

const SageComponentRegex = /^Sage/;
const isSageItem = (item: any) => {
  return item.components?.find( (comp:ICodapSageModelPartial) => SageComponentRegex.test(comp?.componentStorage?.name))
};

// some records had invalid terminal slash in base64String...
const cleanB64Param = (b64string: string) => {
  return b64string.replace("\\","");
}

const processRecord = async (record: Record<string,any>) =>{
  const resultRecord:any = {};

  // Add several topography report keys for our result row:
  const addTopoReport = (questionKey:string, topo:ITopoReport) => {
    resultRecord[`${questionKey}-topo-json`]=JSON.stringify(topo);
    Object.keys(topo).forEach(topoKey => {
      const reportKey = `${questionKey}-${topoKey}`
      resultRecord[reportKey] = (topo as any)[topoKey];
    });
  }

  await Promise.all(Object.keys(record).map( async (key, index) => {
    const value = record[key];
    resultRecord[key] = value;

    if (typeof(value) == 'string') {
      if(LaraLaunchKeyRegex.test(value)) {
        const matches = value.match(LaraLaunchKeyRegex);
        const [paramKey,paramVal] = matches[0].split("=")
        let jsonString = '';
        if(paramVal) {
          try {
            jsonString = base64.decode(cleanB64Param(paramVal));
            const decodedParams = JSON.parse(jsonString);
            const {recordid, accessKeys: {readOnly}} = decodedParams;
            const data = await fetchDocStoreData(recordid, readOnly);
            if(data) {
              const topo = processCodapItem(key, data);
              if(topo) {
                addTopoReport(key, topo);
              }
            }
          }
          catch(e) {
            console.log(e);
          }
        }
      }
    }
  }));
  // resultRecord.topos = topos;
  return resultRecord;
}

export const SageProcessor = async (fileName: string, outDir:string) => {
  console.log(`SageProcessor processing: ${fileName}`);
  let content:Buffer|string = await fs.readFileSync(fileName);

  const records = parse(content, {columns: true});
  const newRecords = await Promise.all(records.map(processRecord));

  const columns:Array<string> = [];
  newRecords.forEach( (r:any) => {
    Object.keys(r).forEach(k => {
      if(columns.indexOf(k) === -1) {
        columns.push(k);
      }
    });
  });
  // TODO: Sorting column headers breaks everything
  // columns.sort();
  const lastPartOfFile = fileName.split('\\').pop().split('/').pop();
  const outPath = `${outDir}/${lastPartOfFile}`;
  console.log(`Writing final output file: → ${outPath}`);
  await fs.writeFileSync(outPath, stringify(newRecords,
    {
      columns: columns,
      header: true
    }
  ));
};
