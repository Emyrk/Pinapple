import React from "react";
import ReactDOM from "react-dom";


// Create a component named MessageComponent
var MessageComponent = React.createClass({
  render: function() {
    return (
      <p>aasdasd</p>
    );
  }
});

// Render an instance of MessageComponent into document.body
ReactDOM.render(
  <MessageComponent message="Hello!" />,
  document.body
);
