import React from "react";
import ReactDOM from "react-dom";
import OptionsForm from "./components/OptionsForm";

window.background = chrome.extension.getBackgroundPage();
window.asanaModel = window.background.asanaModel;

ReactDOM.render(<OptionsForm />, document.getElementById("options-root"));