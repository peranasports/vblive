import { useState, useEffect, useRef } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { fetchUserSettings } from "../utils/dbutils";

export const useAuthStatus = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null)
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem("theme") ?? "garden"
  );
  const [userSettings, setUserSettings] = useState(null);

  const isMounted = useRef(true);

  // const doInit = async (user) => {
  //   const us = await fetchUserSettings(user.email);
  //   setUserSettings(us);
  // };

  useEffect(() => {
    if (isMounted) {
      const auth = getAuth();

      onAuthStateChanged(auth, (user) => {
        if (user) {
          // doInit(user);
          setLoggedIn(true);
          setCurrentUser(user)
          setFirebaseUser(user);
          // fetchUser(user);
        }
        else
        {
          setCurrentUser(null)
        }
        setCheckingStatus(false);
      });
      setCurrentTheme(localStorage.getItem("theme") ?? "garden");
    }

    return () => {
        isMounted.current = false;
    }
  }, [isMounted]);

  return { loggedIn, currentUser, firebaseUser, checkingStatus, currentTheme, userSettings };
};

// Protected routes in V6
// https://stackoverflow.com/questions/65505665/protected-route-with-firebase

// Fix memory Leak warning
// https://stackoverflow.com/questions/59780268/cleanup-memory-leaks-on-an-unmounted-component-in-react-hooks
