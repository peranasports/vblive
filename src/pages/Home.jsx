import React from "react";
import SignIn from "./SignIn";
import Input from "./Input";
import { useAuthStatus } from "../components/hooks/useAuthStatus";
import MainPage from "./MainPage";

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

//  return <>{loggedIn ? <Input /> : <SignIn />}</>;
  return <>{loggedIn ? <MainPage /> : <SignIn />}</>;
}

export default Home;
