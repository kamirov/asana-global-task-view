import React from "react";
import ReactDOM from "react-dom";
import Extension from "./components/Extension";

window.background = chrome.extension.getBackgroundPage();
window.asanaModel = window.background.asanaModel;

ReactDOM.render(<Extension />, document.getElementById('popup-root'));