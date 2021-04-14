import * as Papa from "papaparse";

import * as base64 from "base-64";
import fetch from "node-fetch";
import {ITopoReport, getTopology, ISageGraph} from "./topology-tagger";

export let SuccessCount = 0;
export let FailCount = 0;

const parse = Papa.parse;

// Loading data from the docstore:
// https://github.com/concord-consortium/cloud-file-manager/blob/8757ff5f55de7155cc4aaeac9aafb2938d1b8159/src/code/providers/lara-provider.js#L123

// @see: https://github.com/concord-consortium/cloud-file-manager/blob/8757ff5f55de7155cc4aaeac9aafb2938d1b8159/src/code/providers/document-store-url.js#L64
const v2DocumentUrl = (docId:string, key:string) => {
  const base = `https://document-store.concord.org/v2/documents`;
  const keyParam = `accessKey=RO::${key}`;
  return `${base}/${docId}?${keyParam}`;
}

const fail = (url:string, msg:string) => {
  console.group('DocStoreError');
  console.error(`Failed to fetch: ${url}`)
  console.error(msg);
  console.groupEnd();
  FailCount++;
}

const fetchDocStoreData = async (docId:string, key:string) => {
  const url = v2DocumentUrl(docId,key);
  let response = null;
  try {
    response = await fetch(url, {
      redirect: 'follow', // manual, *follow, error
    });
  }
  catch(e) {
    fail(url, e);
  }
  if (response && !response.ok) {
    fail(url, `${response.status} ${response.statusText}`);
  }
  else {
    SuccessCount++;
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

interface ISageWithOptionalTopology extends ISageGraph {
  topology?: ITopology
}
interface ICodapSageModelPartial {
  componentStorage: {
    name: string,
    savedGameState: ISageWithOptionalTopology
  }
}

const processCodapItem = (key:string, item: any) => {
  let topology: any = {}
  item.components.forEach( (comp:ICodapSageModelPartial) => {
    if(comp.componentStorage?.savedGameState?.topology) {
      topology = comp.componentStorage.savedGameState.topology;
    }
    // If we don't have a topology tag, we need to add one:
    else {
      if(comp.componentStorage?.savedGameState) {
        topology = getTopology(comp.componentStorage.savedGameState);
      }
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
            console.error(e);
            FailCount++;
          }
        }
      }
    }
  }));
  return resultRecord;
}

export const ProcessCSVData = async (content: Buffer|string) => {
  const records = parse(content.toString('utf8'), {columns: true}).data;
  const newRecords = await Promise.all(records.map(processRecord));

  const columns:Array<string> = [];
  newRecords.forEach( (r:any) => {
    Object.keys(r).forEach(k => {
      if(columns.indexOf(k) === -1) {
        columns.push(k);
      }
    });
  });
  return Papa.unparse(newRecords,{ columns: columns, header: true});
}
