// import React from 'React';
// import ReactDOM from 'ReactDOM';

// // class OptionsForm extends React.Component {
// //   constructor(props) {
// //     super(props);
// //     this.state = {
// //       value: 'Please write an essay about your favorite DOM element.'
// //     };

// //     this.handleChange = this.handleChange.bind(this);
// //     this.handleSubmit = this.handleSubmit.bind(this);
// //   }

// //   handleChange(event) {
// //     this.setState({value: event.target.value});
// //   }

// //   handleSubmit(event) {
// //     alert('An essay was submitted: ' + this.state.value);
// //     event.preventDefault();
// //   }

// //   render() {
// //     return (
// //       <form onSubmit={this.handleSubmit}>
// //         <label>
// //           Name:
// //           <textarea value={this.state.value} onChange={this.handleChange} />
// //         </label>
// //         <input type="submit" value="Submit" />
// //       </form>
// //     );
// //   }
// // }

// // ReactDOM.render(<OptionsForm />, document.getElementById('options-root'));

// function Welcome(props) {
//   return <h1>Hello, {props.name}</h1>;
// }

// function App() {
//   return (
//     <div>
//       <Welcome name="Sara" />
//       <Welcome name="Cahal" />
//       <Welcome name="Edite" />
//     </div>
//   );
// }

// ReactDOM.render(
//   <App />,
//   document.getElementById('root')
// );