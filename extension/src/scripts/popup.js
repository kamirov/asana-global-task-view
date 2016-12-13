import React from 'react';
import ReactDOM from 'react-dom';

window.background = chrome.extension.getBackgroundPage();
window.asanaModel = window.background.asanaModel;

// Utility function
window.tabIndex = 0;
function nextTabIndex() {
   return window.tabIndex++;
}

class Extension extends React.Component {
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

   handleSync(event) {

      // Clear any notifications
      chrome.notifications.getAll((notifications) => {
         let notificationIds = Object.keys(notifications);

         notificationIds.forEach((notificationId) => {
            chrome.notifications.clear(notificationId);
         });
      });

      window.asanaModel.sync();
      this.refresh();
   }

   checkForSync() {
      if (window.asanaModel.status === window.asanaModel.allStatuses.SYNC_IN_PROGRESS) {
         if (!this.syncing) {
            this.syncing = true;
            this.refresh();
         }
      }
   }

   refresh() {

      this.setState({
         loaded: false,
         synced: false,
      });

      // Take model data after we've synced
      window.asanaModel.waitForSync()
      .then(() => {

         this.syncing = false;

         this.setState({
            loaded: true,
            synced: true,
            workspaces: this.formatWorkspaces(),
            tasks: this.filterTasks()
         });
      }).catch((err) => {
         console.error(err);
      });

   }

   handleWorkspaceSelect(event) {
      localStorage.setItem("currentWorkspace", event.target.value);

      this.setState({
         tasks: this.filterTasks()
      });
   }

   handleDateChange(event) {
      if (event.target.checked)
         localStorage.setItem("dueToday", "true");
      else
         localStorage.removeItem("dueToday");
      this.setState({
         tasks: this.filterTasks()
      });
   }

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

   filterTasks() {
      let tasks = [];


      let currentWorkspace = localStorage.getItem("currentWorkspace");

      // Filter by workspace
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

      let extensionContents;
      let className = "extension";

      return (
         <div className="extension">
            <div className="extension">
               <Header handleWorkspaceSelect={this.handleWorkspaceSelect} handleDateChange={this.handleDateChange} handleSync={this.handleSync} workspaces={this.state.workspaces} />
               <TaskList tasks={this.state.tasks} />
            </div>
         </div>
      );
   }
}


class Header extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
      };
   }

   openOptionsPage() {  
      chrome.runtime.openOptionsPage();
   }

   render() {
      
      // Make workspace options list
      let workspaceSelect = <div></div>;
      if (this.props.workspaces.length) {
         let workspaces = [];
         workspaces.push(<option value="">All Workspaces</option>);
         this.props.workspaces.forEach((workspace) => {
            workspaces.push(<option value={workspace.id}>{workspace.name}</option>);
         });
         workspaceSelect = <select tabIndex={nextTabIndex()} value={localStorage.getItem("currentWorkspace")} onChange={this.props.handleWorkspaceSelect} className="workspace-select">{workspaces}</select>;
      }

      // Sync error message
      let syncErrorMessage = <div></div>;
      if (window.asanaModel.status == window.asanaModel.allStatuses.SYNC_ERROR)
         syncErrorMessage = <div className="sync-error-message">Problem syncing with Asana. Try again please.</div>;
      else if (window.asanaModel.status == window.asanaModel.allStatuses.NO_TOKEN)
         syncErrorMessage = <div className="sync-error-message"><span className="link-like" onClick={this.openOptionsPage}>Please enter a Personal Access Token.</span></div>;
      else if (window.asanaModel.status == window.asanaModel.allStatuses.BAD_TOKEN)
         syncErrorMessage = <div className="sync-error-message">Personal Access Token is incorrect. <span className="link-like" onClick={this.openOptionsPage}>Please confirm it.</span></div>;



      // Dependent classes
      let syncClasses = ["sync"];
      if (window.asanaModel.status == window.asanaModel.allStatuses.SYNC_IN_PROGRESS)
         syncClasses.push("active");

      return (
         <form className="header">
         
            {workspaceSelect}
            {syncErrorMessage}

            <label className="date-checkbox">
               <input tabIndex={nextTabIndex()} type="checkbox" checked={localStorage.getItem("dueToday")}
                  onChange={this.props.handleDateChange}
               />
               Today's tasks only
            </label>

            <div className={syncClasses.join(" ")}>
                  <span>Syncing...</span>
                  <img tabIndex={nextTabIndex()} src="images/sync.svg" onClick={this.props.handleSync} onKeyPress={this.props.handleSync} />
            </div>
         </form>
      );
   }
}


class TaskList extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         tasks: null
      };
    
      this.uncomplete = this.uncomplete.bind(this);
   }


   uncomplete(notificationId, buttonIndex) {
      chrome.notifications.clear(notificationId);
      
      this.refs[notificationId].uncomplete();
   }


   componentDidMount() {
      chrome.notifications.onButtonClicked.addListener(this.uncomplete);
   }

   render() {
      // Make task list
      let tasks = [];
      this.props.tasks.forEach((task) => {
      

         tasks.push(
            <Task ref={task.id} taskId={task.id} taskName={task.name} project={task.project} workspace={task.workspace} />
         );
      });
      
      return (
            <div className="task-list">{tasks}</div>
      );
   }
}


class Task extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         extraClasses: [],
         completed: false,
      };

      this.complete = this.complete.bind(this);
      this.uncomplete = this.uncomplete.bind(this);
   }


   uncomplete() {
      window.asanaModel.uncompleteTask(this.props.taskId);
      
      this.setState({
         completed: false,
         extraClasses: []
      })
   }


   complete(event) {
      // We can complete either with a click, enter, or space. If this was a keypress, let's make sure it was a space or enter key
      if (event.type === "keypress") {
         if (!(event.charCode === 32 || event.charCode === 13)) { // Space or Enter
            return;            
         }
      }

      if (!this.state.completed) {
         window.asanaModel.completeTask(this.props.taskId);
         this.setState({
            completed: true,
            extraClasses: ["completed"]
         });

         var notificationOptions = {
            type: "list",
            title: "Task completed",
            message: "",
            items: [{ 
               title: `${this.props.taskName}`, 
               message: `${this.props.workspace}, ${this.props.project}`
            }],
            buttons: [{
               "title": "Undo"
            }],
            iconUrl: "images/icon-32.png",
         }
         chrome.notifications.create(this.props.taskId.toString(), notificationOptions);

      }
   }

   render() {

      // Should we move this to TaskList? (I don't think so)
      let extraClasses = this.state.extraClasses.slice();
      if (this.props.taskName.endsWith(":"))
         extraClasses.push("section");         

      return (
         <div tabIndex={nextTabIndex()}
            className={`task ${extraClasses.join(" ")}`} onKeyPress={this.complete} onClick={this.complete}>
            <div className="check-and-name">
               <div className="check">
                  <svg viewBox="0 0 32 32">
                     <polygon points="27.672,4.786 10.901,21.557 4.328,14.984 1.5,17.812 10.901,27.214 30.5,7.615 "></polygon>
                  </svg>
               </div>
               <span className="name">{this.props.taskName}</span>
            </div>
            <TaskInfo project={this.props.project} workspace={this.props.workspace} />
         </div>
      );
   }
}


class TaskInfo extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
      };

   }

   render() {
      return (
         <div className="task-info pill-container">
            {
               !localStorage.getItem("currentWorkspace") && 
                  <span className="pill workspace" title={this.props.workspace}>
                     {this.props.workspace}
                  </span>
            }
            <span className="pill project" title={this.props.project}>
               {this.props.project}
            </span>
         </div>
      );
   }
}


ReactDOM.render(<Extension />, document.getElementById('popup-root'));