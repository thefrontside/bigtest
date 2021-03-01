import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import './toolbar.css';
import SVG from '../assets/logo-white-square.svg';

const App = () => {
  let version = new URLSearchParams(window.location.search).get('ver');
  
  function click(){
    // console.log(document.querySelector('iframe[id=test-frame]')?.contentWindow.document.querySelector('iframe[id=app-frame]')?.contentWindow.location.href);
    // console.log('app frame exists click:');
    console.log('hello')
  };
  
  function callback(m) {
    console.log('hi', m)
  }

  useEffect(() => {
    let targetNode = document.getElementById('test-frame').contentWindow.document;
    let config = { attributes: true, childList: true, subtree: true };
    let observer = new MutationObserver(callback);
    observer.observe(targetNode, config);
  }, []);

  return (
    <div id="toolbar">
      <img src={SVG} id="logo"/>
        {version ? version : 'no app'}
      <button onClick={click}>hello</button>
    </div>
  );
};

ReactDOM.render(
  <App />,
  document.getElementById('header')
);
