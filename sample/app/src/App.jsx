import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import './App.css';

const App = () => {
  let [isSignedIn, setIsSignedIn] = React.useState(false);
  
  return (
    <Router>
      <div className="App">
        <div className="header">
          <nav>
            <div className="label">
              Nav
            </div>
            <Link to="/">/home</Link>
            <Link to="/about">/about</Link>
          </nav>
          <div className="button">
            <div className="label">
              Button
            </div>
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
        </div>
        <div className="body">
          <Switch>
            <Route path="/about">
              <h1>About page</h1>
            </Route>
            <Route path="/">
              <h1>Home page</h1>
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
};

export default App;
