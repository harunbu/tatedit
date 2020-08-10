import React from 'react';
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <React.Fragment>
      <h1>Plot Note!</h1>

      <Link to="/editor">エディタ起動</Link>
    </React.Fragment>
  );
};

export default Login;
