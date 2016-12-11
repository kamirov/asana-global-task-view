import React from 'react';
import ReactDOM from 'react-dom';

window.background = chrome.extension.getBackgroundPage();
window.asana_model = window.background.asana_model;

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
   }

   handleWorkspaceSelect(event) {
      localStorage.currentWorkspace = event.target.value;

      this.setState({
         tasks: this.formatWorkspaceTasks()
      });
   }

   formatWorkspaces() {
      let workspaces = [];
      for(let workspace_id in window.asana_model.items) {
         workspaces.push({
            id: workspace_id,
            name: window.asana_model.items[workspace_id].name
         });
      }

      return workspaces;
   }

   formatWorkspaceTasks() {
      if (localStorage.currentWorkspace) {
         return window.asana_model.items[localStorage.currentWorkspace].tasks;
      } else { // We're returning all workspace tasks
         let tasks = [];
         for (let workspace_id in window.asana_model.items)
            tasks = [...tasks, ...window.asana_model.items[workspace_id].tasks];

         return tasks;
      }  
   }


   componentDidMount() {
      console.log('mounting');
      // Take model data after we've synced
      window.asana_model.wait_for_sync()
      .then(() => {
         console.log('success!');

         this.setState({
            loaded: true,
            synced: true,
            workspaces: this.formatWorkspaces(),
            tasks: this.formatWorkspaceTasks()
         });
      })
      .catch((err) => {
         console.error(err);
      });
   }

   render() {

      let extension_contents;
      let className = "extension";

      if (this.state.loaded && this.state.synced) {
         extension_contents = <div className="extension">
            <Header handleWorkspaceSelect={this.handleWorkspaceSelect} workspaces={this.state.workspaces} />
            <TaskList tasks={this.state.tasks} />
         </div>;
      } else if (this.state_loaded) {
         extension_contents = <div className="extension">
            <span>Error syncing...</span>
         </div>;
      } else {
         extension_contents = <div className="extension">
            <span>Loading...</span>
         </div>;
      }

      return (
         <div className="extension">
            {extension_contents}
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
            <select value={localStorage.currentWorkspace} onChange={this.props.handleWorkspaceSelect} className="workspace-select">{workspaces}</select>
            <label className="tagged-cont">
               <input type="text" placeholder="Tagged" />
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
         console.log(task);
         tasks.push(
            <Task task_id={task.id} task_name={task.name} project={task.project} />
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
               <span className="name">{this.props.task_name}</span>
            </div>
            <TaskInfo project={this.props.project} />
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
            <span className="pill project">{this.props.project}</span>
         </div>
      );
   }
}


ReactDOM.render(<Extension />, document.getElementById('popup-root'));