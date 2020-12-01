import React from 'react';
import './App.css';

const App = () => {
  let [isSignedIn, setIsSignedIn] = React.useState(false)
  return (
    <div className="App">
      {!isSignedIn &&
        <button onClick={() => setIsSignedIn(true)}>
          SIGN IN
        </button>
      }

      {isSignedIn &&
        <button onClick={() => setIsSignedIn(false)}>
          LOG OUT
        </button>
      }
    </div>
  );
};

export default App;