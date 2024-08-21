import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
// import App from './App';
import StarRating from "./StarRating";
import App from "./App";
// import reportWebVitals from './reportWebVitals';
function Test() {
  const [setRating, toSetRating] = useState(0);
  function handler(x) {
    toSetRating(x);
  }
  return (
    <div>
      <StarRating onSetRating={(x) => handler(x)} />
      <p>the selected value is{setRating}</p>
    </div>
  );
}
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
