import React from "react";
import ReactDOM from "react-dom";

window.background = chrome.extension.getBackgroundPage();
window.asanaModel = window.background.asanaModel;

class OptionsForm extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         accessToken: localStorage.getItem("accessToken"),
         includeUnassigned: localStorage.getItem("includeUnassigned") ? true : false,
         dueToday: localStorage.getItem("dueToday") ? true : false
      };

      this.handleTokenChange = this.handleTokenChange.bind(this);
      this.handleAssigneeChange = this.handleAssigneeChange.bind(this);
      this.handleDueDateChange = this.handleDueDateChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
   }

   handleTokenChange(event) {
      this.setState({ accessToken: event.target.value });
   }

   handleAssigneeChange(event) {
     this.setState({ includeUnassigned: event.target.checked });
   }

   handleDueDateChange(event) {
     this.setState({ dueToday: event.target.checked });
   }

   handleSubmit(event) {
      localStorage.setItem("accessToken", this.state.accessToken);

      if (this.state.includeUnassigned)
         localStorage.setItem("includeUnassigned", "true");
      else
         localStorage.removeItem("includeUnassigned");

      if (this.state.dueToday)
         localStorage.setItem("dueToday", "true");
      else
         localStorage.removeItem("dueToday");

      window.asanaModel.sync();
      window.close();

      event.preventDefault();
   }

   render() {
      return (
         <form className="smart-green" onSubmit={this.handleSubmit}>
            <label>
               Personal Access Token:
              <input type="text" placeholder="" value={this.state.accessToken} onChange={this.handleTokenChange} />
            </label>

            <label>
               <input type="checkbox" checked={this.state.includeUnassigned}
                  onChange={this.handleAssigneeChange}
               />
               Include unassigned tasks
            </label>

            <label>
               <input type="checkbox" checked={this.state.dueToday}
                  onChange={this.handleDueDateChange}
               />
               Only show today's tasks
            </label>


            <input type="submit" value="Submit" />
         </form>
      );
   }
}

ReactDOM.render(<OptionsForm />, document.getElementById("options-root"));