import asana from 'asana';

const STATUS = {
   DEFAULT: Symbol("No status information yet"),
   NO_TOKEN: Symbol("No access token yet"),
   BAD_TOKEN: Symbol("Incorrect access token"),
   SYNC_SUCCESS: Symbol("Synced with Asana server. All data retrieved"),
   SYNC_ERROR: Symbol("Problem syncing with Asana's server."),
   SYNC_IN_PROGRESS: Symbol("Sync is currently in progress")
};


/**
 * Interfaces with the Asana REST API
 * @export
 * @class Asana_model
 */
export default class Asana_model {

   /**
    * Creates an instance of Asana_model.
    * @param {number} accessToken - Asana personal access token
    */
   constructor(accessToken) {
      this.client = asana.Client.create().useAccessToken(accessToken);
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
      this.status = STATUS.DEFAULT;
   }

   /**
    * Gets user's personal and workspace data. Updates personal data directly, returns workspace data to be processed.
    * @return {Promise} Promise containing workspace data
    */
   updateUser() {
      chrome.extension.getBackgroundPage().console.log("updateUser");

      return new Promise((resolve, reject) => {

         // Get personal Asana information
         this.client.users.me().then(res => {
            
            // chrome.extension.getBackgroundPage().console.log(res);

            this.status = STATUS.SYNC_IN_PROGRESS;
            this.user = {
               id: res.id,
               name: res.name
            };

            // Add workspaces to state
            chrome.extension.getBackgroundPage().console.log("res.workspaces", res.workspaces);
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
                  this.status = STATUS.BAD_TOKEN;
               else
                  this.status = STATUS.NO_TOKEN;            
            else
               this.status = STATUS.SYNC_ERROR;

            reject("Couldn't retrieve personal information");
         });
      });
   }


   updateProjects() {
      chrome.extension.getBackgroundPage().console.log("updateProjects");

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


   updateTasks() {
      chrome.extension.getBackgroundPage().console.log("updateTasks");
      return new Promise((resolve, reject) => {

         let currentIdx = 0;
         let numIndices = this.project_count;

         for (let workspaceKey in this.items) {
            let workspace = this.items[workspaceKey];

            chrome.extension.getBackgroundPage().console.log("workspace.projects", workspace.projects);
            workspace.projects.forEach(project => {

               // chrome.extension.getBackgroundPage().console.log(project);

               // Get list of tasks in each project
               this.client.tasks.findByProject(project.id, {
                  completed_since: 'now',
                  opt_fields: 'name,id,due_on,due_at,assignee'
               }).then(res => {
                  currentIdx++;
                  chrome.extension.getBackgroundPage().console.log(res);


                  chrome.extension.getBackgroundPage().console.log("res.data", res.data);
                  res.data.forEach(task => {
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
    * Resets, then updates all Asana state properties.
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
         this.status = STATUS.SYNC_IN_PROGRESS;

         chrome.extension.getBackgroundPage().console.log("chain_start");

         // Update state
         this.updateUser()
         .then((workspaces) => this.updateProjects(workspaces))
         .then((projects) => this.updateTasks(projects))
         .then(() => {
            chrome.extension.getBackgroundPage().console.log("success");

            // Some last minute fixes
            
            // Remove locally cached values if they are no longer valid
            if (!this.items[localStorage.getItem("currentWorkspace")])
               localStorage.removeItem('currentWorkspace');
            

            this.status = STATUS.SYNC_SUCCESS;
            // Is this how we should handle success?
            resolve();
         })
         .catch(reason => {
            chrome.extension.getBackgroundPage().console.error(reason);
            reject(reason);
         });         
      });
   }

   waitForSync() {
      return new Promise((resolve, reject) => {
         // If we're syncing, then check back regularly until we're done
         if (this.status === STATUS.SYNC_IN_PROGRESS) {
            let interval = setInterval(() => {
               if (this.status === STATUS.SYNC_SUCCESS) {
                  clearInterval(interval);
                  resolve();
               }
               else if (this.status === STATUS.SYNC_ERROR) {
                  clearInterval(interval);
                  reject();
               }
            }, 500);
         } else if (this.status === STATUS.SYNC_SUCCESS) {
            resolve();
         } else {
            reject();
         }
      });
   }

}