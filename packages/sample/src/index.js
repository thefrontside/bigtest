import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function App() {
  let [isSignedIn, setIsSignedIn] = React.useState(false)
  return (
    <div className="App">
      {!isSignedIn &&
        <button onClick={() => setIsSignedIn(true)}>
          Sign In
        </button>
      }

      {isSignedIn &&
        <button onClick={() => setIsSignedIn(false)}>
          Log Out
        </button>
      }
    </div>
  );
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
