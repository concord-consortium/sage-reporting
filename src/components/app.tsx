import * as React from "react";
import * as ReactDOM from "react-dom";
import { ProcessCSVData } from "../process-sage";
import { XSLtoCSV } from "../process-xlsx";
// import FileDownload from "js-file-download";
// import { CsvToHtmlTable } from "react-csv-to-table";
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

export const App = (props: IAppProps) => {
  const [csv, setCsv] = React.useState('');
  const [fileName, setFileName] = React.useState('');

  const handleFileChange = async (event:React.ChangeEvent<HTMLInputElement>) => {
    if(event.target.files) {
      const selectedFile = event.target.files.item(0);
      const fileName = selectedFile.name;

      const arrayBuff = await selectedFile.arrayBuffer()
      const data = new Uint8Array(arrayBuff);
      const csvString = XSLtoCSV(data);
      const processedCsv:string = await ProcessCSVData(csvString);
      setFileName(fileName.replace(/\.xlsx?/i, ".csv"));
      setCsv(processedCsv);
    }
  }

  return(
    <>
      <h1>
        Hi {props.userName} from React! Welcome to {props.place}!
      </h1>
      <input type="file" id="input" onChange={handleFileChange}/>
      <DownloadLink csvString={csv} fileName={fileName} />
      {/* <CsvToHtmlTable data={csv} csvDelimiter="," /> */}
    </>
  );
};


ReactDOM.render(
  <App userName="Researcher" place="report converter" />,
  document.getElementById("output")
);
