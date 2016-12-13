// import asana from "asana";

// let client = asana.Client.create().useAccessToken("0/e3d4d097511d056b1d701e5916f7e6b6");

// client.users.me().then(function(me) {
//   console.log(me);
// });

import React from "react";
import ReactDOM from "react-dom";

class OptionsForm extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         accessToken: localStorage.getItem("accessToken"),
         includeUnassigned: localStorage.getItem("includeUnassigned") ? true : false
      };

      this.handleTokenChange = this.handleTokenChange.bind(this);
      this.handleAssigneeChange = this.handleAssigneeChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
   }

   handleTokenChange(event) {
      this.setState({ accessToken: event.target.value });
   }

   handleAssigneeChange(event) {
     this.setState({ includeUnassigned: event.target.checked });
   }

   handleSubmit(event) {
      localStorage.setItem("accessToken", this.state.accessToken);

      if (this.state.includeUnassigned)
         localStorage.setItem("includeUnassigned", "true");
      else
         localStorage.removeItem("includeUnassigned");

      event.preventDefault();
   }

   render() {
      return (
         <form onSubmit={this.handleSubmit}>
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


            <input type="submit" value="Submit" />
         </form>
      );
   }
}

ReactDOM.render(<OptionsForm />, document.getElementById("options-root"));