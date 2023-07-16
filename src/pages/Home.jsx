import React from "react";
import SignIn from "./SignIn";
import Input from "./Input";
import { useAuthStatus } from "../components/hooks/useAuthStatus";

function Home() {
  const { loggedIn, currentUser, checkingStatus } = useAuthStatus();

  return <>{loggedIn ? <Input /> : <SignIn />}</>;
}

export default Home;
