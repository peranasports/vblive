import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { db } from "../firebase.config";

// Icons
import {
  ArrowRightIcon,
  EyeIcon,
  EyeSlashIcon,
  eyes,
} from "@heroicons/react/20/solid";

// Firebase Authentication
import {
  createUserWithEmailAndPassword,
  updateProfile,
  getAuth,
} from "firebase/auth";

import {
  setDoc,
  doc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

// React Toastify
import { toast } from "react-toastify";
import { async } from "@firebase/util";

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { name, email, password } = formData;

  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  // const updateUserRecord = async (user, role, name, timestamp) => {
  //   try {
  //     const eRef = collection(db, "users");
  //     const q = query(eRef, where("email", "==", user.email));
  //     const querySnap = await getDocs(q);
  //     const usrs = [];
  //     querySnap.forEach((doc) => {
  //       return usrs.push({
  //         id: doc.id,
  //         data: doc.data(),
  //       });
  //     });
  //     if (usrs.length > 0) {
  //       var usr = usrs[0].data;
  //       usr.uid = user.uid;
  //       usr.email = user.email;
  //       usr.role = role;
  //       usr.name = name;
  //       usr.timestamp = timestamp;
  //       await setDoc(doc(db, "users", usrs[0].id), usr);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const onSubmit = async (e) => {
    e.preventDefault();
      try {
        const auth = getAuth();

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const user = userCredential.user;

        // updateUserRecord(user, role, name, serverTimestamp());

        updateProfile(auth.currentUser, {
          displayName: name,
        });

        const formDataCopy = { ...formData };

        delete formDataCopy.password;

        formDataCopy.timestamp = serverTimestamp();

        // setDoc what updates to users collections
        // doc holds the configuration - user.uid the key
        // second parameter is the object to be saved
        // await setDoc(doc(db, "users", user.uid), formDataCopy);
        toast.success("Signed up successfully");
        // if (role === 2) {
        //   coach.userId = user.uid;
        //   await setDoc(doc(db, "coaches", coach.uid), coach);
        //   navigate("/coach", { state: coach.userId });
        // } else if (role === 3) {
        //   student.userId = user.uid;
        //   await setDoc(doc(db, "students", student.uid), student);
        //   navigate("/student", { state: student.userId });
        // }
      } catch (error) {
        toast.error("Error signing up\n" + error.message);
      }
    // } else {
    //   toast.error("Error signing up.\nPlease contact supports@peranasports.com.");
    // }
  };

  return (
    <>
      <div className="pageContainer">
        <header>
          <p className="pageHeader mt-10 text-xl">Sign up for free!</p>
        </header>

        <main>
          <form className=" max-w-md" onSubmit={onSubmit}>
            {/* <input
              type="text"
              id="name"
              className='w-full mt-10 pr-40 bg-gray-200 input text-xl input-md text-black'
              placeholder="Name"
              value={name}
              onChange={onChange}
            /> */}

            <input
              type="email"
              id="email"
              className="w-full mt-10 pr-40 bg-gray-200 input text-xl input-md text-black"
              placeholder="Email"
              value={email}
              onChange={onChange}
            />

            <div className="passwordInputDiv relative my-10">
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

              {/* <img
                src={showPassword ? EyeSlashIcon : EyeIcon}
                className="showPassword absolute top-0 bg-slate-600 right-0 rounded-l-none w-24 btn btn-md"
                alt="Show Password"
                onClick={() => setShowPassword((prevState) => !prevState)}
              /> */}
            </div>

            <div className="signUpBar">
              <button className="mt-6 top-0 right-0 rounded-l-none w-36 btn btn-lg btn-primary">
                Sign Up
              </button>
            </div>
          </form>

          <div className="mt-10">
            <Link
              to="/signin"
              className="link link-success text-xl text-success"
            >
              Sign In
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}

export default SignUp;
