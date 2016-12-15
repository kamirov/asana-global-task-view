import React from "react";
import TaskInfo from "./TaskInfo";
import { nextTabIndex } from "../utils";

/**
 * Holds Asana task information
 * @export
 * @class Task
 * @extends {React.Component}
 */
export default class Task extends React.Component {
   constructor(props) {
      super(props);

      this.complete = this.complete.bind(this);
      this.uncomplete = this.uncomplete.bind(this);
   }


   /**
    * Sets a task to "uncomplete"
    */
   uncomplete() {
      window.asanaModel.uncompleteTask(this.props.data.id);
      // console.log(this.props.data.name, this.state)
   }


   /**
    * Sets a task to "complete"
    * @param {Event} event
    */
   complete(event) {
      // We can complete either with a click, enter, or space. If this was a keypress, let's make sure it was a space or enter key
      if (event.type === "keypress") {
         if (!(event.charCode === 32 || event.charCode === 13)) { // Space or Enter
            return;            
         }
      }

      // Update the model
      window.asanaModel.completeTask(this.props.data.id);

      // Notify user
      var notificationOptions = {
         type: "list",
         title: "Task completed",
         message: "",
         items: [{ 
            title: `${this.props.data.name}`, 
            message: `${this.props.data.workspace}, ${this.props.data.project}`
         }],
         buttons: [{
            "title": "Undo"
         }],
         iconUrl: "images/icon-32.png",
      }
      chrome.notifications.create(this.props.data.id.toString(), notificationOptions);         

      this.props.onComplete();
   }


   render() {

      let extraClasses = [];
      if (this.props.data.name.endsWith(":"))      // Maybe we should hold this data in the model
         extraClasses.push("section");
      if (this.props.data.completed)
         extraClasses.push("completed");
         
      console.log("task nextTabIndex");

      return (
         <div tabIndex={nextTabIndex()}
            className={`task ${extraClasses.join(" ")}`} onKeyPress={this.complete} onClick={this.complete}>
            <div className="check-and-name">
               <div className="check">
                  <svg viewBox="0 0 32 32">
                     <polygon points="27.672,4.786 10.901,21.557 4.328,14.984 1.5,17.812 10.901,27.214 30.5,7.615 "></polygon>
                  </svg>
               </div>
               <span className="name">{this.props.data.name}</span>
            </div>
            <TaskInfo project={this.props.data.project} workspace={this.props.data.workspace} />
         </div>
      );
   }
}