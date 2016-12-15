import React from "react";
import Header from "./Header";
import TaskList from "./TaskList";
import { clearNotifications } from "../utils";


/**
 * Main popup component
 * @export
 * @class Extension
 * @extends {React.Component}
 */
export default class Extension extends React.Component {
   constructor(props) { 
      super(props);
      this.state = {
         loaded: false,
         synced: false,
         workspaces: [],
         tasks: []
      };

      this.syncing = false;
      this.syncInterval = null;

      this.handleSync = this.handleSync.bind(this);
      this.handleWorkspaceSelect = this.handleWorkspaceSelect.bind(this);
      this.handleDateChange = this.handleDateChange.bind(this);
   }


   /**
    * Click handler for manual sync (pressing the sync button)
    * @param {Event} event
    */
   handleSync(event) {
      clearNotifications();
      window.asanaModel.sync();
      this.refresh();
   }


   /**
    * Interval handler, checks if the model is syncing. If it is, updates the view to start waiting for the sync to finish
    */
   checkForSync() {
      if (window.asanaModel.status === window.asanaModel.allStatuses.SYNC_IN_PROGRESS) {
         if (!this.syncing) {
            this.syncing = true;
            this.refresh();
         }
      }
   }


   /**
    * Waits for the model to finish syncing, then updates the view
    */
   refresh() {
      this.setState({
         loaded: false,
         synced: false,
      });

      // console.log("Waiting for sync");
      // Take model data after we've synced
      window.asanaModel.waitForSync()
      .then(() => {

         this.syncing = false;
         
         let workspaces = this.formatWorkspaces();
         let tasks = this.filterTasks();
         this.setState({
            loaded: true,
            synced: true,
            workspaces: workspaces,
            tasks: tasks
         });
            // console.log("sync finished")
      });

   }


   /**
    * Handler for workspace switching
    * @param {Event} event
    */
   handleWorkspaceSelect(event) {
      clearNotifications();
      localStorage.setItem("currentWorkspace", event.target.value);

      let tasks = this.filterTasks();
      this.setState({
         tasks: tasks
      });
   }


   /**
    * Handler for "show today's tasks" enabling. Currently not used.
    * @param {Event} event
    */
   handleDateChange(event) {
      if (event.target.checked)
         localStorage.setItem("dueToday", "true");
      else
         localStorage.removeItem("dueToday");
      this.setState({
         tasks: this.filterTasks()
      });
   }


   /**
    * Gets list of workspaces from the model
    * @returns Array of workspace objects
    */
   formatWorkspaces() {
      let workspaces = [];
      for(let workspaceId in window.asanaModel.items) {
         workspaces.push({
            id: workspaceId,
            name: window.asanaModel.items[workspaceId].name
         });
      }

      return workspaces;
   }


   /**
    * Gets list of tasks from the model. Filters them based on the view's settings
    * @returns Array of task objects
    */
   filterTasks() {

      let tasks = [];

      // Filter by workspace
      let currentWorkspace = localStorage.getItem("currentWorkspace");
      if (currentWorkspace) {
         tasks = window.asanaModel.items[currentWorkspace].tasks;
      } else { // We're returning all workspace tasks
         for (let workspaceId in window.asanaModel.items) {

            if (window.asanaModel.items[workspaceId])
               tasks = [...tasks, ...window.asanaModel.items[workspaceId].tasks];
         }
      }  

      // Filter by date
      if (localStorage.getItem("dueToday")) {
         let today = new Date();
         today.setHours(0, 0, 0, 0);

         let preDateTasks = tasks;
         tasks = [];
         preDateTasks.forEach((task) => {
            // Only look at tasks with a due date
            if (task.dueOn) {

               // Have to do some fiddling with the date returned by Asana. I'm not sure why, but when converted to a Date, it's off by one day.
               let dueOn = new Date(task.dueOn);
               dueOn.setHours(0,0,0,0);
               dueOn.setDate(dueOn.getDate() + 1);

               if (today.getTime() === dueOn.getTime())
                  tasks.push(task); 
            }
       });
       
      }

      return tasks;
   }


   componentDidMount() {
      this.refresh();
      this.syncInterval = setInterval(() => {
         this.checkForSync();
      }, 1000);
   }


   render() {

      // console.log("==================================")

      return (
         <div className="extension">
            <Header handleWorkspaceSelect={this.handleWorkspaceSelect} handleDateChange={this.handleDateChange} handleSync={this.handleSync} workspaces={this.state.workspaces} />
            <TaskList tasks={this.state.tasks} />
         </div>
      );
   }
}