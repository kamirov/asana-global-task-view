// import asana from 'asana';

// let client = asana.Client.create().useAccessToken('0/e3d4d097511d056b1d701e5916f7e6b6');

// client.users.me().then(function(me) {
//   console.log(me);
// });

import React from 'react';
import ReactDOM from 'react-dom';

class OptionsForm extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         accessToken: localStorage.accessToken
      };

      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
   }

   handleChange(event) {
      this.setState({ accessToken: event.target.value });
   }

   handleSubmit(event) {
      localStorage.accessToken = this.state.accessToken;
      // chrome.storage.sync.set({accessToken: this.state.accessToken});
      event.preventDefault();
   }

   render() {
      return (
         <form onSubmit={this.handleSubmit}>
            <label>
               Personal Access Token:
          <input type="text" placeholder="" value={this.state.accessToken} onChange={this.handleChange} />
            </label>
            <input type="submit" value="Submit" />
         </form>
      );
   }
}

ReactDOM.render(<OptionsForm />, document.getElementById('options-root'));