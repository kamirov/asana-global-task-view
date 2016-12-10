import Asana_model from './Asana_model';
window.asana_model = new Asana_model(localStorage.accessToken);

chrome.extension.getBackgroundPage().console.log(localStorage.accessToken);