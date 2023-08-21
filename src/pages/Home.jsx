import React from "react";
import SignIn from "./SignIn";
import Input from "./Input";
import { useAuthStatus } from "../components/hooks/useAuthStatus";

function Home() {
  const { loggedIn, currentUser, checkingStatus } = useAuthStatus();

  // const chokidar = require('chokidar');
  // const watcher = chokidar.watch('/path/to/directory', {
  //   ignored: /(^|[\/\\])\../, // ignore dotfiles
  //   persistent: true
  // });
  // watcher
  //   .on('add', path => console.log(`File ${path} has been added`))
  //   .on('change', path => console.log(`File ${path} has been changed`))

  return <>{loggedIn ? <Input /> : <SignIn />}</>;
}

export default Home;
