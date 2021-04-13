import * as React from "react";
import * as ReactDOM from "react-dom";
import { XSLtoCSV } from "../process-xlsx";
import { CsvToHtmlTable } from "react-csv-to-table";
export interface IProps {
  userName: string;
  place: string;
}

const handleFileChange = async (event:React.ChangeEvent<HTMLInputElement>) => {
  if(event.target.files) {
    const numFiles = event.target.files.length
    const selectedFile = event.target.files.item(0);
    console.log(`Selected file that is ${selectedFile.size} long`);
    const arrayBuff = await selectedFile.arrayBuffer()
    const data = new Uint8Array(arrayBuff);
    console.log(selectedFile);
    const csvString = XSLtoCSV(data);
  }
}

export const App = (props: IProps) => {
  const [csv, setCsv] = React.useState('');

  const handleFileChange = async (event:React.ChangeEvent<HTMLInputElement>) => {
    if(event.target.files) {
      const numFiles = event.target.files.length
      const selectedFile = event.target.files.item(0);
      console.log(`Selected file that is ${selectedFile.size} long`);
      const arrayBuff = await selectedFile.arrayBuffer()
      const data = new Uint8Array(arrayBuff);
      console.log(selectedFile);
      const csvString = XSLtoCSV(data);
      setCsv(csvString);
    }
  }

  return(
    <>
      <h1>
        Hi {props.userName} from React! Welcome to {props.place}!
      </h1>
      <input type="file" id="input" onChange={handleFileChange}/>
      <CsvToHtmlTable data={csv} csvDelimiter="," />
    </>
  );
};


ReactDOM.render(
  <App userName="Researcher" place="report converter" />,
  document.getElementById("output")
);