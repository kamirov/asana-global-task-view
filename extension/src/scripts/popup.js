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
         current_workspace: '',
         tasks: []
      };
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
      if (this.state.current_workspace) {
         return window.asana_model.items[this.state.current_workspace];
      } else { // We're returning all workspace tasks
         let tasks = [];
         for (let workspace_id in window.asana_model.items)
            tasks.push(window.asana_model.items[workspace_id].tasks);
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

      console.log(this.state, this.state.loaded && this.state.synced);

      if (this.state.loaded && this.state.synced) {
         extension_contents = <div>
            <Header workspaces={this.state.workspaces} current={this.state.current_workspace} />
            <TaskList tasks={this.state.tasks} />
         </div>;
      } else if (this.state_loaded) {
         extension_contents = <div className="loading-overlay">
            <span>Error syncing...</span>
         </div>;
      } else {
         extension_contents = <div className="loading-overlay">
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

      return (
         <form>
            <select>{workspaces}</select>
            <label>
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
      return (
         <ul>

         </ul>
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
         <span></span>
      );
   }
}

ReactDOM.render(<Extension />, document.getElementById('popup-root'));