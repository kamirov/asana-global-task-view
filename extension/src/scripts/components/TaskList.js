import React from "react";
import Task from "./Task";

/**
 * Holds list of tasks
 * @export
 * @class TaskList
 * @extends {React.Component}
 */
export default class TaskList extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         taskCount: null
      };
    
      this.complete = this.complete.bind(this);
      this.uncomplete = this.uncomplete.bind(this);
   }


   /**
    * List's handler for a task completion. Currently this is used to indirectly rerender the list. We should change this. Maybe a direct forceUpdate() call
    */
   complete() {
     this.setState({ taskCount: this.state.taskCount + 1 });
   }


   /**
    * List's handler for a task completion undo. This is done through a Chrome notification button click
    * @param {string} notificationId
    * @param {int} buttonIndex
    */
   uncomplete(notificationId, buttonIndex) {
      chrome.notifications.clear(notificationId);
      this.refs[notificationId].uncomplete();
      this.setState({ taskCount: this.state.taskCount - 1 });
     }

  
   componentDidMount() {
      chrome.notifications.onButtonClicked.addListener(this.uncomplete);
      this.setState({ taskCount: this.props.tasks.length });
   }


   render() {
      // Make task list
      let tasks = [];
      this.props.tasks.forEach((task) => {
         tasks.push(
            <Task ref={task.id} data={task} onComplete={this.complete} />
         );
      });

      return (
            <div className="task-list">{tasks}</div>
      );
   }
}