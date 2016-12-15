import React from "react";
import { nextTabIndex } from "../utils";

/**
 * Holds some task list filtering UI
 * @export
 * @class Header
 * @extends {React.Component}
 */
export default class Header extends React.Component {

   /**
    * Open extension's Options page
    */
   openOptionsPage() {  
      chrome.runtime.openOptionsPage();
   }


   render() {
      
      console.log("Header nextTabIndex");

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

      // Sync status specific business (There should be a nicer way to do this)
      let syncClasses = ["sync"];
      let formClasses = [];
      let syncErrorMessage = <div class="hidden"></div>;
      if (window.asanaModel.status == window.asanaModel.allStatuses.SYNC_ERROR) {
         syncClasses.push("hidden");
         formClasses.push("empty");
         syncErrorMessage = <div className="sync-error-message">Problem syncing with Asana. Try again please.</div>;
      }
      else if (window.asanaModel.status == window.asanaModel.allStatuses.NO_TOKEN) {
         syncClasses.push("hidden");
         formClasses.push("empty");
         syncErrorMessage = <div className="sync-error-message"><span className="link-like" onClick={this.openOptionsPage}>Please enter a Personal Access Token</span>.</div>;
      }
      else if (window.asanaModel.status == window.asanaModel.allStatuses.BAD_TOKEN) {
         syncClasses.push("hidden");
         formClasses.push("empty");
         syncErrorMessage = <div className="sync-error-message">Personal Access Token is incorrect. <span className="link-like" onClick={this.openOptionsPage}>Please confirm it</span>.</div>;
      }
      else if (window.asanaModel.status == window.asanaModel.allStatuses.SYNC_IN_PROGRESS) {
         syncClasses.push("active");
      }
      else if (window.asanaModel.status == window.asanaModel.allStatuses.SYNC_SUCCESS) {

      }


      return (
         <form className={`header ${formClasses.join("")}`}>
         
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