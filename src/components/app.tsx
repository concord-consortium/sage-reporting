import * as React from "react";
import * as ReactDOM from "react-dom";
import { ProcessCSVData } from "../process-sage";
import { XSLtoCSV } from "../process-xlsx";

export interface IAppProps {
  userName: string;
  place: string;
}

export interface IDownloadLinkProps {
  csvString: string;
  fileName: string;
}

const DownloadLink = (props: IDownloadLinkProps) => {
  const {csvString, fileName} = props;
  const blob = new Blob([csvString], {type:'text/csv'})
  const downloadURL = window.URL.createObjectURL(blob);
  if (csvString && csvString.length > 0) {
    return (
      <div>
        <a href={downloadURL} download={fileName}>
          download {fileName}
        </a>
      </div>
    )
  }
  return(<></>);
}

interface ICSVFileRecord {
  content: string;
  fileName: string;
}
export const App = (props: IAppProps) => {
  const [CSVs, setCSVs] = React.useState([]);
  const [status, setStatus] = React.useState('');

  const addCSV = (csv:ICSVFileRecord) => {
    setCSVs([...CSVs, csv]);
    console.log(CSVs);
  }

  const handleFileChange = async (event:React.ChangeEvent<HTMLInputElement>) => {
    const csvs = [];
    if(event.target.files) {
      for(let selectedFile of Array.from(event.target.files)) {
        const fn = selectedFile.name.replace(/\.xlsx?/i, ".csv");
        setStatus(`Working with ${fn}`);
        const arrayBuff = await selectedFile.arrayBuffer();
        const data = new Uint8Array(arrayBuff);
        const csvString = XSLtoCSV(data);
        const content = await ProcessCSVData(csvString, (msg:string)=> {setStatus(`${fn} ${msg}`)});
        const processedCsv:ICSVFileRecord = {content, fileName:fn};
        csvs.push(processedCsv);
      }
    }
    setCSVs(csvs);
    setStatus('Complete.');
  }

  return(
    <>
      <h1>
        Sage Model Topology Report Generator.
      </h1>

      <h2>Instructions:</h2>
      <div className="instructions">
        <ol>
          <li>Select one or more ".xlsx" files from your computer by clicking the "Choose Files" button.</li>
          <li>Wait for the processing to complete, then click on the generated download links.</li>
        </ol>
      </div>

      <hr/>
      <input type="file" id="input" multiple={true} accept=".xlsx" onChange={handleFileChange}/>
      {
        CSVs.map( (csv:ICSVFileRecord) => {
          return <DownloadLink key={csv.fileName} csvString={csv.content} fileName={csv.fileName} />
        })
      }

      <div className="status">
        {status}
      </div>
    </>
  );
};


ReactDOM.render(
  <App userName="Researcher" place="report converter" />,
  document.getElementById("output")
);
