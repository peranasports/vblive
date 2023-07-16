import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  setDoc,
  doc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
} from "@heroicons/react/20/solid";
import { db } from "../firebase.config";

// Icons
//import { ReactComponent as ArrowRightIcon } from "../assets/svg/keyboardArrowRightIcon.svg";
//import visibilityIcon from "../assets/svg/visibilityIcon.svg";

// Firebase Authentication
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";

// React Toastify
import { toast } from "react-toastify";

function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { email, password } = formData;

  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  // const fetchUser = async (user) => {
  //   try {
  //     const eRef = collection(db, "users");
  //     const q = query(eRef, where("uid", "==", user.uid));
  //     const querySnap = await getDocs(q);
  //     const empls = [];
  //     querySnap.forEach((doc) => {
  //       return empls.push(doc.data());
  //     });
  //     if (empls.length > 0) {
  //       var empl = empls[0];
  //     } else {
  //       const q2 = query(eRef, where("emailAddress", "==", user.email));
  //       const querySnap2 = await getDocs(q2);
  //       querySnap2.forEach((doc) => {
  //         return empls.push({
  //           id: doc.id,
  //           data: doc.data(),
  //         });
  //       });
  //       if (empls.length > 0) {
  //         var empl = empls[0].data;
  //         empl.uid = user.uid;
  //         await setDoc(doc(db, "users", empls[0].id), empl);
  //       }
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  //   return empl;
  // };

  const onSubmit = async (e) => { 
    e.preventDefault();

    try {
      const auth = getAuth();

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (userCredential.user) {
        navigate("/input");
        // var user = await fetchUser(userCredential.user);
        // console.log(user.role + " " + user.email);
        // if (user.role === 1) {
        //   navigate("/admin", { state: user });
        // } else if (user.role === 2) {
        //   if (user.active === false) {
        //     toast.error("You are no longer an active user at ts-online");
        //   } else {
        //     navigate("/coach", { state: user.uid });
        //   }
        // } else if (user.role === 3) {
        //   if (user.active === false) {
        //     toast.error("You are no longer an active user at CRMS");
        //   } else {
        //     navigate("/student", { state: user.uid });
        //   }
        // } else if (user.role === 0) {
        //   navigate("/import-psts", { state: user });
        // }
      }
    } catch (error) {
      toast.error("Error Signing In\n" + error.message);
    }
  };

  return (
    <>
      <div className="pageContainer">
        <header>
          <p className="pageHeader mt-10 text-xl">Welcome Back!</p>
        </header>

        <main>
          <form className=" max-w-md" onSubmit={onSubmit}>
            <input
              type="email"
              id="email"
              className="w-full mt-10 pr-40 bg-gray-200 input text-xl input-md text-black"
              // className="emailInput"
              placeholder="Email"
              value={email}
              onChange={onChange}
            />

            <div className="passwordInputDiv relative mt-10 mb-2">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="w-full pr-40 bg-gray-200 input text-xl input-md text-black"
                // className="passwordInput"
                placeholder="Password"
                value={password}
                onChange={onChange}
              />
              {/* <button
                type='submit'
                className='absolute mt-10 top-0 right-0 rounded-l-none w-36 btn btn-lg'>
                Go
              </button> */}

              {showPassword ? (
                <EyeSlashIcon
                  className="showPassword absolute top-0 right-0 rounded-l-none w-16 btn btn-md text-gray-400"
                  aria-hidden="true"
                  onClick={() => setShowPassword((prevState) => !prevState)}
                />
              ) : (
                <EyeIcon
                  className="showPassword absolute top-0 right-0 rounded-l-none w-16 btn btn-md text-gray-400"
                  aria-hidden="true"
                  onClick={() => setShowPassword((prevState) => !prevState)}
                />
              )}
            </div>

            <Link
              to="/forgot-password"
              className="link link-error text-xl text-success mt-6"
            >
              Forgot Password
            </Link>

            <div className="signInBar">
              <button className="mt-10 w-40 btn btn-lg btn-primary">
                Sign In
              </button>
            </div>
          </form>
          <div className="flex gap-2 mt-6 text-xl">
            <p>Don't have an account? </p>
            <Link to="/signup" className="w-40 text-xl text-success">
              Sign up for free!
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}

export default SignIn;
