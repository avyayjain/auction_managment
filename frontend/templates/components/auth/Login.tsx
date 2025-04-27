import * as React from 'react';
import {loginUser} from "../../api/auth";
import {saveToken} from "../../utils/auth";
import {useState} from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginUser(email, password)
        .then(res => {
          saveToken(res.access_token);
          window.location.href = "/";
        })
        .catch(err => {
          console.error(err);
          alert("Login failed");
        });
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br/>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br/>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
