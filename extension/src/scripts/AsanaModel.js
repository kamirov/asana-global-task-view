import asana from 'asana';

/**
 * Interfaces with the Asana REST API
 * @export
 * @class Asana_model
 */
export default class Asana_model {

   /**
    * Creates an instance of Asana_model.
    */
   constructor() {

      this.allStatuses = {
         DEFAULT: Symbol("No status information yet"),
         NO_TOKEN: Symbol("No access token yet"),
         BAD_TOKEN: Symbol("Incorrect access token"),
         SYNC_SUCCESS: Symbol("Synced with Asana server. All data retrieved"),
         SYNC_ERROR: Symbol("Problem syncing with Asana's server."),
         SYNC_IN_PROGRESS: Symbol("Sync is currently in progress")
      };
      this.client = null;
      this.syncIntervalInitialized = false;
      this.sync();
   }

   /**
    * Clears state properties
    */   
   refresh() {
      this.user = {};
      this.items = {};
      this.tag = "";
      this.project_count = 0;
      this.status = this.allStatuses.DEFAULT;
   }


   completeTask(taskId) {

      // Remove the task from all workspaces
      for (let workspaceKey in this.items) {
         let tasks = this.items[workspaceKey].tasks;

         // Find the item index in the workspace's list of tasks and remove it
         for(let k = 0; k < tasks.length; k++) {
            if (tasks[k].id === taskId) {
               this.items[workspaceKey].tasks.splice(k, 1);
               break;
            }
         }
      }

      // Remove it from Asana
      return new Promise((resolve, reject) => {
         this.client.tasks.update(taskId, {
            completed: true
         }).then((response) => {

            resolve();
         }).catch((error) => {
            reject();
         });
      });
   }


   uncompleteTask(taskId) {

      // Remove it from Asana
      return new Promise((resolve, reject) => {
         this.client.tasks.update(taskId, {
            completed: false
         }).then((response) => {

            resolve();
         }).catch((error) => {
            reject();
         });
      });
   }
   

   /**
    * Gets user's personal and workspace data. Gets personal data directly, returns workspace data to be processed.
    * @return {Promise} Promise containing workspace data
    */
   getUser() {

      return new Promise((resolve, reject) => {

         // Get personal Asana information
         this.client.users.me().then(res => {
            
            // chrome.extension.getBackgroundPage().console.log(res);

            this.status = this.allStatuses.SYNC_IN_PROGRESS;
            this.user = {
               id: res.id,
               name: res.name
            };

            // Add workspaces to state
            res.workspaces.forEach(workspace => {
               // chrome.extension.getBackgroundPage().console.log(workspace);
               this.items[workspace.id] = {
                  id: workspace.id,
                  name: workspace.name,
                  projects: [],
                  tasks: []
               };
            });
            
            resolve();

         }, err => {
            // How did the res fail?
            if (err.status === 401)
               if (localStorage.getItem("accessToken"))
                  this.status = this.allStatuses.BAD_TOKEN;
               else
                  this.status = this.allStatuses.NO_TOKEN;            
            else
               this.status = this.allStatuses.SYNC_ERROR;

            reject("Couldn't retrieve personal information");
         });
      });
   }


   getProjects() {

      return new Promise((resolve, reject) => {

         let currentIdx = 0;
         let numIndices = Object.keys(this.items).length;  // Number of workspaces

         for (let workspaceKey in this.items) {
            let workspace = this.items[workspaceKey];

            // Get list of projects in workspace
            this.client.projects.findAll({
               workspace: workspace.id
            }).then(res => {
               // chrome.extension.getBackgroundPage().console.log(res);

               // Add projects to state
               this.items[workspace.id].projects = res.data;
               this.project_count += res.data.length;
               currentIdx++;

               // chrome.extension.getBackgroundPage().console.log(`${currentIdx} of ${numIndices}`);

               if (currentIdx === numIndices) {
                  // chrome.extension.getBackgroundPage().console.log(res);
                  resolve();
               }
            });
         }
      });
   }


   getTasks() {
      return new Promise((resolve, reject) => {

         let currentIdx = 0;
         let numIndices = this.project_count;

         for (let workspaceKey in this.items) {
            let workspace = this.items[workspaceKey];

            workspace.projects.forEach(project => {

               // Get list of tasks in each project
               this.client.tasks.findByProject(project.id, {
                  completed_since: 'now',
                  // assignee: (localStorage.getItem("includeUnassigned") ? this.user.id : null),
                  opt_fields: 'name,id,due_on,due_at,assignee'
               }).then(res => {
                  currentIdx++;

                  res.data.forEach(task => {
                     // Ignore blank tasks
                     if (!task.name) 
                        return;
                     
                     //    If we're only interested in tasks assigned to a specific user, then filter for those here
                     if (!localStorage.getItem("includeUnassigned")) {
                        // Does the task have an owner? Is it the logged in user?
                        if (task.assignee === null
                            || task.assignee.id !== this.user.id )
                            return;
                     }  

                     this.items[workspaceKey].tasks.push({
                        id: task.id,
                        name: task.name,
                        dueAt: task.due_at,
                        dueOn: task.due_on,
                        project: project.name,
                        workspace: workspace.name
                     });


                  });

                  if (currentIdx === numIndices) {
                     // chrome.extension.getBackgroundPage().console.log(res);
                  resolve();
               }

               });     
            });  
         }
      });
   }


   /**
    * Resets, then gets all Asana state properties.
    * @return {Promise}
    */
   sync() {

      if (!this.syncIntervalInitialized)
      {
         setInterval(() => {
            this.sync();
         }, 1000 * 60 * 30);

         this.syncIntervalInitialized = true;
      }
      
      return new Promise((resolve, reject) => {

         // Reset state
         this.refresh();
         this.status = this.allStatuses.SYNC_IN_PROGRESS;

         // Get state
         this.client = asana.Client.create().useAccessToken(localStorage.getItem("accessToken"));
         this.getUser()
         .then((workspaces) => this.getProjects(workspaces))
         .then((projects) => this.getTasks(projects))
         .then(() => {

            // Some last minute fixes
            
            // Remove locally cached values if they are no longer valid
            if (!this.items[localStorage.getItem("currentWorkspace")])
               localStorage.removeItem('currentWorkspace');
            

            this.status = this.allStatuses.SYNC_SUCCESS;
            // Is this how we should handle success?
            resolve();
         })
         .catch(reason => {
            // chrome.extension.getBackgroundPage().console.error(reason);
            reject(reason);
         });         
      });
   }

   waitForSync() {
      return new Promise((resolve, reject) => {
         // If we're syncing, then check back regularly until we're done
         if (this.status === this.allStatuses.SYNC_IN_PROGRESS) {
            let interval = setInterval(() => {
               if (this.status === this.allStatuses.SYNC_SUCCESS) {
                  clearInterval(interval);
                  resolve();
               }
               else if (this.status === this.allStatuses.SYNC_ERROR) {
                  clearInterval(interval);
                  reject();
               }
            }, 500);
         } else if (this.status === this.allStatuses.SYNC_SUCCESS) {
            resolve();
         } else {
            reject();
         }
      });
   }

}

// export {allStatuses, AsanaModel};