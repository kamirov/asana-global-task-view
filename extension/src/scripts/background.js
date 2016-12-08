import Asana_model from './Asana_model';
window.asana_model = new Asana_model();

chrome.extension.getBackgroundPage().console.log('foo');