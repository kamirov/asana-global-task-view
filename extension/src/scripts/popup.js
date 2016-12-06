// import asana from 'asana';

// let client = asana.Client.create().useAccessToken('0/e3d4d097511d056b1d701e5916f7e6b6');

// client.users.me().then(function(me) {
//   console.log(me);
// });

import React from 'react';
import ReactDOM from 'react-dom';

class Extension extends React.Component {
   constructor(props) { 
      super(props);
      this.state = {
      };
   }

   render() {
      return (
         <div className="extension">
            <Header />
            <TaskList />
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
      return (
         <form>
            <select></select>
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
      };
   }

   render() {
      return (
         <Task />
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