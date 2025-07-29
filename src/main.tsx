import React from "react";
import ReactDOM from "react-dom/client";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./firebaseConfig";
import App from "./App";

initializeApp(firebaseConfig);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 