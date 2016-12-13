import React from 'react';
import ReactDOM from 'react-dom';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

window.background = chrome.extension.getBackgroundPage();
window.asanaModel = window.background.asanaModel;

window.chrome_notification_listener_set = false;

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

      this.handleSync = this.handleSync.bind(this);
      this.handleWorkspaceSelect = this.handleWorkspaceSelect.bind(this);
      this.handleDateChange = this.handleDateChange.bind(this);
   }

   handleSync(event) {
      console.log('handleSync');

      window.asanaModel.sync();
      this.refresh();
   }

   refresh() {
      
      // Zero state data
      this.setState({
         loaded: false,
         synced: false,
         workspaces: [],
         tasks: []
      });

      // Take model data after we've synced
      window.asanaModel.waitForSync()
      .then(() => {
         console.log('success!');

         this.setState({
            loaded: true,
            synced: true,
            workspaces: this.formatWorkspaces(),
            tasks: this.filterTasks()
         });
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
      console.log("formatting workspaces");
      let workspaces = [];
      for(let workspaceId in window.asanaModel.items) {
         workspaces.push({
            id: workspaceId,
            name: window.asanaModel.items[workspaceId].name
         });
      }

      console.log("done formatting workspaces");

      return workspaces;
   }

   filterTasks() {
      let tasks = [];

      console.log("filtering tasks");

      let currentWorkspace = localStorage.getItem("currentWorkspace");

      // Filter by workspace
      if (currentWorkspace) {
         console.log(`getting only workspace's tasks (${currentWorkspace})`)
         tasks = window.asanaModel.items[currentWorkspace].tasks;
      } else { // We're returning all workspace tasks
         console.log(`getting all workspace tasks`)
         for (let workspaceId in window.asanaModel.items) {

            console.log(`for workspace ID ${workspaceId}`)

            if (window.asanaModel.items[workspaceId])
               tasks = [...tasks, ...window.asanaModel.items[workspaceId].tasks];
         }

      }  

      
      console.log("done filtering tasks by workspace");

      console.log(tasks);

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

      console.log("done filtering tasks by date");
      console.log(tasks);

      return tasks;
   }


   componentDidMount() {
      console.log('mounting');
      this.refresh();
   }

   render() {

      let extensionContents;
      let className = "extension";
      let syncStatus = false;

      if (this.state.loaded && this.state.synced)
         syncStatus = window.asanaModel.allStatuses.SYNC_SUCCESS;   
      else if (this.state.loaded)
         syncStatus = window.asanaModel.allStatuses.SYNC_ERROR;   
      else
         syncStatus = window.asanaModel.allStatuses.SYNC_IN_PROGRESS;   



      return (
         <div className="extension">
            <div className="extension">
               <Header handleWorkspaceSelect={this.handleWorkspaceSelect} handleDateChange={this.handleDateChange} handleSync={this.handleSync} workspaces={this.state.workspaces} syncStatus={syncStatus} />
               <TaskList tasks={this.state.tasks} syncStatus={syncStatus} />
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

   render() {
      
      // Make workspace options list
      let workspaces = [];
      workspaces.push(<option value="">All Workspaces</option>);
      this.props.workspaces.forEach((workspace) => {
         workspaces.push(<option value={workspace.id}>{workspace.name}</option>);
      });

      console.log(this.props);

      // Dependent classes
      let syncClasses = ["sync"];
      if (this.props.syncStatus == window.asanaModel.allStatuses.SYNC_IN_PROGRESS)
         syncClasses.push("active");

      return (
         <form className="header">
            <select tabIndex={nextTabIndex()} value={localStorage.getItem("currentWorkspace")} onChange={this.props.handleWorkspaceSelect} className="workspace-select">{workspaces}</select>

            <label className="dateCheckbox">
               <input tabIndex={nextTabIndex()} type="checkbox" checked={localStorage.getItem("dueToday")}
                  onChange={this.props.handleDateChange}
               />
               Today's tasks only
            </label>

            <img tabIndex={nextTabIndex()} src="images/sync.svg" className={syncClasses.join(" ")} onClick={this.props.handleSync} onKeyPress={this.props.handleSync} />
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

      console.log("rendering tasklist");

      // Make task list
      let tasks = [];
      this.props.tasks.forEach((task) => {
      

         tasks.push(
            <Task ref={task.id} taskId={task.id} taskName={task.name} project={task.project} workspace={task.workspace} />
         );
      });
      
      console.log("tasks", this.props.tasks, tasks);
      console.log("Here");
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
      console.log(`Undoing ${this.props.taskId}`)

      window.asanaModel.uncompleteTask(this.props.taskId);
      
      this.setState({
         completed: false,
         extraClasses: []
      })
   }


   complete(event) {
      console.log(event, event.target);

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
         })

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

         console.log(event, this.props);
      }
   }

   render() {

      console.log("rendering task");

      // Should we move this to TaskList? (I don't think so)
      let extraClasses = this.state.extraClasses.slice();
      if (this.props.taskName.endsWith(":"))
         extraClasses.push("section");
      console.log(this.state.extraClasses)
         

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

      console.log(this.props);
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