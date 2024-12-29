import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import VBLiveLogo from "../components/assets/VBLive_Logo.png";
import PSLogo from "../components/assets/PeranaSportsLogo.png";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
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
        navigate("/mainpage");
      }
    } catch (error) {
      toast.error("Error Signing In\n" + error.message);
    }
  };

  return (
    <>
      <div className="flex min-h-full flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <main>
          <div className="flex  justify-center">
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

            <Link
              to="/forgotpassword"
              className="link link-error text-sm text-base-content mt-4"
            >
              Forgot Password
            </Link>

            <div className="signInBar">
              <button className="mt-4 w-full btn-in-form">
                Sign In
              </button>
            </div>
          </form>
          <div className="flex gap-2 my-8 text-sm">
            <p className="mt-1">Don't have an account? </p>
            <Link
              to="/signup"
              className="px-8 py-1 text-center text-sm text-secondary-content bg-secondary/80 rounded-md"
            >
              Sign up for free!
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

export default SignIn;
