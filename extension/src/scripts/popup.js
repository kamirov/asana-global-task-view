import React from 'react';
import ReactDOM from 'react-dom';

window.background = chrome.extension.getBackgroundPage();
window.asanaModel = window.background.asanaModel;

class Extension extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         loaded: false,
         synced: false,
         workspaces: [],
         tasks: []
      };

      this.handleWorkspaceSelect = this.handleWorkspaceSelect.bind(this);
      this.handleDateChange = this.handleDateChange.bind(this);
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

   render() {

      let extensionContents;
      let className = "extension";

      if (this.state.loaded && this.state.synced) {
         extensionContents = <div className="extension">
            <Header handleWorkspaceSelect={this.handleWorkspaceSelect} handleDateChange={this.handleDateChange} workspaces={this.state.workspaces} />
            <TaskList tasks={this.state.tasks} />
         </div>;
      } else if (this.state.loaded) {
         extensionContents = <div className="extension">
            <span>Error syncing...</span>
         </div>;
      } else {
         extensionContents = <div className="extension">
            <span>Loading...</span>
         </div>;
      }

      return (
         <div className="extension">
            {extensionContents}
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

      return (
         <form className="header">
            <select value={localStorage.getItem("currentWorkspace")} onChange={this.props.handleWorkspaceSelect} className="workspace-select">{workspaces}</select>

            <label className="dateCheckbox">
               <input type="checkbox" checked={localStorage.getItem("dueToday")}
                  onChange={this.props.handleDateChange}
               />
               Today's tasks only
            </label>
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
   }

   render() {

      // Make task list
      let tasks = [];
      this.props.tasks.forEach((task) => {

         tasks.push(
            <Task taskId={task.id} taskName={task.name} project={task.project} workspace={task.workspace} />
         );
      });
      
      console.log("tasks", this.props.tasks, tasks);

      return (
         <div className="task-list">{tasks}</div>
      );
   }
}


class Task extends React.Component {
   constructor(props) {
      super(props);
      this.state = { 
      };
   }

   render() {
      return (
         <div className="task">
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
                  <span className="pill workspace">
                     {this.props.workspace}
                  </span>
            }
            <span className="pill project">
               {this.props.project}
            </span>
         </div>
      );
   }
}


ReactDOM.render(<Extension />, document.getElementById('popup-root'));