import { useState, useEffect, useRef } from "react";

// Firebase Authentication
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../firebase.config"
// import { toast } from "react-toastify";
// import { collection, query, where, getDocs } from "firebase/firestore"

export const useAuthStatus = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null)
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem("theme") ?? "garden"
  );

  const isMounted = useRef(true);

  useEffect(() => {
    if (isMounted) {
      const auth = getAuth();

    //   const fetchUser = async (user) => {
    //     try {
    //       const eRef = collection(db, "users");
    //       const q = query(
    //           eRef,
    //           where("uid", "==", user.uid)
    //       );
    //       const querySnap = await getDocs(q);
    //       const usrs = [];
    //       querySnap.forEach((doc) => {
    //           return usrs.push({
    //               id: doc.id,
    //               data: doc.data(),
    //           });
    //       });
    //       if (usrs.length > 0)
    //       {
    //         var empl = usrs[0].data
    //         setCurrentUser(empl);
    //       }
    //       } catch (error) {
    //         console.log(error)
    //     }
    
    //     // try {
    //     //     if (user === null)
    //     //     {
    //     //         setEmployee(null)
    //     //         return
    //     //     }
    //     //     const docRef = doc(db, "employees", user.uid);
    //     //     const docSnap = await getDoc(docRef);
            
    //     //     if (docSnap.exists()) {
    //     //       console.log("Document data:", docSnap.data());
    //     //     } else {
    //     //       // doc.data() will be undefined in this case
    //     //       console.log("No such document!");
    //     //     }
    //     //     setEmployee(docSnap.data());
    //     // } catch (error) {
    //     //     toast.error("Could not fetch employee");
    //     // }
    // };

      onAuthStateChanged(auth, (user) => {
        if (user) {
          setLoggedIn(true);
          setCurrentUser(user)
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

  return { loggedIn, currentUser, checkingStatus, currentTheme };
};

// Protected routes in V6
// https://stackoverflow.com/questions/65505665/protected-route-with-firebase

// Fix memory Leak warning
// https://stackoverflow.com/questions/59780268/cleanup-memory-leaks-on-an-unmounted-component-in-react-hooks
