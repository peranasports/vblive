import { useState } from "react";
import { useNavigate } from "react-router-dom";
import VBLiveLogo from "../components/assets/logo512.png";
// Firebase Authentication
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";

function SignIn() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { email, password } = formData;

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
        // var user = await fetchUser(userCredential.user)
        // console.log(user.role + " " + user.email)
        // if (user.role === 1) {
        //   navigate('/admin', { state: user })
        // }
        // else if (user.role === 2)
        // {
        //   if (user.active === false)
        //   {
        //     // toast.error("You are no longer an active user at CRMS");
        //   }
        //   else
        //   {
        //     navigate('/coach', { state: user.uid });
        //   }
        // }
        // else if (user.role === 3)
        // {
        //   if (user.active === false)
        //   {
        //     // toast.error("You are no longer an active user at CRMS");
        //   }
        //   else
        //   {
        //     navigate('/student', { state: user.uid });
        //   }
        // }
      }
    } catch (error) {
      // toast.error("Error Signing In\n" + error.message);
    }
  };

  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-white">
        <body class="h-full">
        ```
      */}
      <div className="flex min-h-full flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm space-y-10">
          <div>
            <img
              className="mx-auto h-20 w-auto"
              src={VBLiveLogo}
              alt="Perana sports"
            />
            <p className="text-3xl font-bold text-center">VBLive</p>
            <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-base-900">
              Sign in to your account
            </h2>
          </div>
          <form className="space-y-6" action="#" method="POST">
            <div className="relative -space-y-px rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-0 z-10 rounded-md ring-1 ring-inset ring-gray-300" />
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-2"
                  placeholder="Email address"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="relative block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-2"
                  placeholder="Password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-3 block text-sm leading-6 text-base-900"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm leading-6">
                <a
                  href="#"
                  className="font-semibold text-secondary hover:text-secondary"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-secondary px-3 py-1.5 text-sm font-semibold leading-6 text-white hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign in
              </button>
            </div>
          </form>

          <p className="text-center text-sm leading-6 text-base-500">
            Not a member?{" "}
            <a
              href="#"
              className="font-semibold text-secondary hover:text-secondary-300"
            >
              Sign up for free
            </a>
          </p>
        </div>
      </div>
    </>
  );
}

export default SignIn;
