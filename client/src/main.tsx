import { createRoot } from "react-dom/client";
//import { StrictMode } from "react";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/castoro/400.css";
import "@fontsource/castoro/400-italic.css";
import "bootstrap/dist/css/bootstrap-utilities.css";
import "./assets/styles/styles.css";
import App from "./App";

createRoot(document.getElementById("root")).render(
  //<StrictMode>
  <App />
  //</StrictMode>
);
