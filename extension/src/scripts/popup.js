import React from 'react';
import ReactDOM from 'react-dom';

// Tmp data
const samp_workspaces = {
   "data": [
      {
         "id": 17961646,
         "name": "Workspace A"
      },
      {
         "id": 2342342,
         "name": "Workspace B"
      }
   ],
   "next_page": null
};

const samp_projects = {
   "data": [
      {
         "id": 341234,
         "name": "Project A"
      },
      {
         "id": 2333,
         "name": "Project B"
      }
   ],
   "next_page": null
};

const samp_tasks = {
   "data": [
      {
         "id": 2342344,
         "name": "Task A",
         "completed": false,
         "due_on": null,
         "due_at": null,
         "assignee": {
            "id": 2134234
         }
      },
      {
         "id": 234234,
         "name": "Task B",
         "completed": true,
         "due_on": "2016-06-12",
         "due_at": "2016-06-12T10:00:00.000Z",
         "assignee": null
      },
   ],
   "next_page": null
};


function update_state() {

}

// // Tmp (represents an Asana GET request)
// function async_get(dataset) {
//    return new Promise(function(resolve, reject) {
//       setTimeout(() => {
//          resolve(dataset);
//       }, 3000);
//    });
// }


class Extension extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         loaded: false,
         workspaces: [],
         tasks: []
      };
   }

   componentDidMount() {

      // asana_model.update_state().then()

      // // Get list of workspaces
      // let workspaces_raw;

      // console.log("Getting all workspaces...")
      // async_get(samp_workspaces).then(function(response) {
      //    console.log("Got workspaces");

      //    this.state.workspaces.data.forEach((workspace) => {
      //       console.log("Getting all projects in " + workspace.name + "...")
      //       async_get(samp_projects).then(function(response) {
      //          console.log("Got projects");

      //          return 
      //       });
      //    });
      // });

      // setTimeout(() => {
      //    this.setState({ workspaces: samp_workspaces });

      //    this.state.workspaces.data.forEach((workspace) => {

      //       console.log("Getting all projects in " + workspace.name + "...")

      //       setTimeout(() => {
      //          this.setState({ projects: samp_projects })
      //          this.state.projects.data.forEach((project) => {

      //             console.log("Getting all tasks in " + project.name + "...")

      //             setTimeout(() => {
      //                this.setState({ tasks_data: samp_tasks });
      //             }, 3000);
      //          });

      //       }, 3000);
      //    });

      // }, 2000);
   }

   render() {

      let extension_contents;

      if (this.state.loaded) {
         extension_contents = <div>
            <Header workspaces={this.state.workspaces} />
            <TaskList tasks={this.state.tasks} />
         </div>;
      }
      else {
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
      this.props.workspaces.data.forEach((workspace) => {
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