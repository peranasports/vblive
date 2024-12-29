import { Link } from "react-router-dom";
import { useState } from "react";
import VBLiveLogo from "../components/assets/VBLive_Logo.png";
import PSLogo from "../components/assets/PeranaSportsLogo.png";

// Icons
import {
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

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

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

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

      toast.success("Signed up successfully");
    } catch (error) {
      toast.error("Error signing up\n" + error.message);
    }
  };

  return (
    <>
      <div className="flex min-h-full flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <main>
          <div className="flex justify-center">
            <img src={VBLiveLogo} className="w-60" alt="VBLive" />
          </div>
          <form className="mt-10 max-w-md" onSubmit={onSubmit}>
            <input
              type="email"
              id="email"
              className="input-generic"
              placeholder="Email"
              value={email}
              onChange={onChange}
            />

            <div className="passwordInputDiv relative mt-4 mb-2">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="input-generic"
                placeholder="Password"
                value={password}
                onChange={onChange}
              />

              {showPassword ? (
                <EyeSlashIcon
                  className="size-14 showPassword absolute top-0 right-0 h-9 text-base-content/50 btn btn-in-form rounded-r-md rounded-l-none"
                  aria-hidden="true"
                  onClick={() => setShowPassword((prevState) => !prevState)}
                />
              ) : (
                <EyeIcon
                  className="size-14 showPassword absolute top-0 right-0 h-9 text-base-content/50 btn btn-in-form rounded-r-md rounded-l-none"
                  aria-hidden="true"
                  onClick={() => setShowPassword((prevState) => !prevState)}
                />
              )}
            </div>

            <div className="signUpBar">
              <button className="mt-4 w-full btn-in-form">Sign Up</button>
            </div>
          </form>

          <div className="mt-10 flex gap-4">
            <div className="text-sm">All ready signed up?</div>
            <Link
              to="/signin"
              className="px-8 py-1 text-center text-sm text-secondary-content bg-secondary/80 rounded-md"
            >
              Sign In
            </Link>
          </div>
          <div className="flex justify-center w-full bg-white mt-10">
            <img src={PSLogo} className="w-60" alt="VBLive" />
          </div>
        </main>
      </div>
    </>
  );
}

export default SignUp;
