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
} from "@heroicons/react/24/outline";
import VBLiveLogo from "../components/assets/VBLive_Logo.png";
import PSLogo from "../components/assets/PeranaSportsLogo.png";

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
        // navigate("/input");
        const st = { liveMatches: [], userEmail: email };
        navigate("/matcheslist", { state: st });    
      }
    } catch (error) {
      toast.error("Error Signing In\n" + error.message);
    }
  };

  return (
    <>
      <div className="flex min-h-full flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        {/* <header>
          <p className="pageHeader mt-10 text-xl">Welcome Back!</p>
        </header> */}

        <main>
          <div className="flex  justify-center">
            <img src={VBLiveLogo} className="w-60" alt="VBLive" />
          </div>

          <form className=" max-w-md" onSubmit={onSubmit}>
            <input
              type="email"
              id="email"
              className="w-full mt-10 pr-40 bg-base-300 input input-sm text-base-content rounded-none"
              // className="emailInput"
              placeholder="Email"
              value={email}
              onChange={onChange}
            />

            <div className="passwordInputDiv relative mt-4 mb-2">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="w-full pr-40 bg-base-300 input input-sm text-base-content rounded-none"
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
                  className="showPassword absolute top-0 right-0 rounded-none w-12 btn btn-sm bg-opacity-50 text-base-content hover:bg-opacity-20"
                  aria-hidden="true"
                  onClick={() => setShowPassword((prevState) => !prevState)}
                />
              ) : (
                <EyeIcon
                  className="showPassword absolute top-0 right-0 rounded-none w-12 btn btn-sm bg-opacity-50 text-base-content hover:bg-opacity-20"
                  aria-hidden="true"
                  onClick={() => setShowPassword((prevState) => !prevState)}
                />
              )}
            </div>

            <Link
              to="/forgot-password"
              className="link link-error text-sm text-base-content mt-4"
            >
              Forgot Password
            </Link>

            <div className="signInBar">
              <button className="mt-4 w-full btn btn-md btn-primary rounded-none">
                Sign In
              </button>
            </div>
          </form>
          <div className="flex gap-2 my-8 text-sm">
            <p className="mt-1">Don't have an account? </p>
            <Link
              to="/signup"
              className="px-8 py-1 text-center text-sm text-info-content bg-info"
            >
              Sign up for free!
            </Link>
          </div>
          <div className="flex justify-center w-full bg-white">
            <img src={PSLogo} className="w-60" alt="VBLive" />
          </div>
        </main>
      </div>
    </>
  );
}

export default SignIn;
