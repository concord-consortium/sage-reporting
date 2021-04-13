import * as React from "react";
import * as ReactDOM from "react-dom";

export interface HelloWorldProps {
  userName: string;
  lang: string;
}
export const App = (props: HelloWorldProps) => (
  <h1>
    Hi {props.userName} from React! Welcome to {props.lang}!
  </h1>
);

ReactDOM.render(
  <App userName="Developer Dingus" lang="TypeScript" />,
  document.getElementById("output")
);