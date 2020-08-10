import React from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";

import Top from './components/Top';
import Login from './components/Login';
import Editor from './components/Editor';

function App() {
  return (
    <Router>
      <Route exact path="/" component={Top}></Route>
      <Route path="/login" component={Login}></Route>
      <Route path="/editor" component={Editor}></Route>
    </Router>
  );
}

export default App;
