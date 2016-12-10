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

      // Sync and set up recurring syncs
      this.sync();
      setInterval(() => {
         this.sync();
      }, 1000 * 60 * 5);
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
   update_user() {
      chrome.extension.getBackgroundPage().console.log("update_user");

      return new Promise((resolve, reject) => {

         // Get personal Asana information
         this.client.users.me().then(res => {
            
            chrome.extension.getBackgroundPage().console.log(res);

            this.status = STATUS.SYNC_IN_PROGRESS;
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
               if (localStorage.accessToken)
                  this.status = STATUS.BAD_TOKEN;
               else
                  this.status = STATUS.NO_TOKEN;            
            else
               this.status = STATUS.SYNC_ERROR;

            reject("Couldn't retrieve personal information");
         });
      });
   }


   update_projects() {
      chrome.extension.getBackgroundPage().console.log("update_projects");

      return new Promise((resolve, reject) => {

         let current_idx = 0;
         let num_indices = Object.keys(this.items).length;

         for (let workspace_key in this.items) {
            let workspace = this.items[workspace_key];

            // Get list of projects in workspace
            this.client.projects.findAll({
               workspace: workspace.id
            }).then(res => {
               // chrome.extension.getBackgroundPage().console.log(res);

               // Add projects to state
               this.items[workspace.id].projects = res.data;
               this.project_count += res.data.length;
               current_idx++;

               chrome.extension.getBackgroundPage().console.log(`${current_idx} of ${num_indices}`);

               if (current_idx === num_indices) {
                  // chrome.extension.getBackgroundPage().console.log(res);
                  resolve();
               }
            });
         }
      });
   }


   update_tasks() {
      chrome.extension.getBackgroundPage().console.log("update_tasks");
      return new Promise((resolve, reject) => {

         let current_idx = 0;
         let num_indices = this.project_count;

         for (let workspace_key in this.items) {
            let workspace = this.items[workspace_key];

            workspace.projects.forEach(project => {

               chrome.extension.getBackgroundPage().console.log(project);                

               // Get list of tasks in each project
               this.client.tasks.findByProject(project.id, {
                  completed_since: 'now',
                  opt_fields: 'name,id,due_on,due_at,assignee'
               }).then(res => {
                  chrome.extension.getBackgroundPage().console.log(res);

                  res.data.forEach(task => {
                     this.items[workspace_key].tasks.push({
                        id: task.id,
                        name: task.name,
                        due_at: task.due_at,
                        due_on: task.due_on,
                        project: project.name,
                     });
                  });
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
      return new Promise((resolve, reject) => {

         // Reset state
         this.refresh();

         // Update state
         this.update_user()
         .then((workspaces) => this.update_projects(workspaces))
         .then((projects) => this.update_tasks(projects))
         .then(() => {
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
}