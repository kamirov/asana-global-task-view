import React from "react";

/**
 * 
 * Task meta info view (project, workspace, eventually tags)
 * @export
 * @class TaskInfo
 * @extends {React.Component}
 */
export default class TaskInfo extends React.Component {

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