import { Link } from "react-router-dom";
import { useState } from "react";

// Firebase Authentication
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { db } from "../firebase.config";

// Icons
import { ArrowRightIcon } from "@heroicons/react/20/solid";

// Toast
import { toast } from "react-toastify";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const onChange = (e) => setEmail(e.target.value);

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const auth = getAuth();

      await sendPasswordResetEmail(auth, email);

      toast.success("Email was sent to " + email);
    } catch (error) {
      toast.error("Could not send reset email");
    }
  };

  return (
    <div className="pageContainer">
      <header>
        <p className="pageHeader mt-10 text-sm mb-10">Forgot Password</p>
      </header>

      <main>
        <form onSubmit={onSubmit}>
          <input
            type="email"
            id="email"
            className='input-generic'
            placeholder="Enter your email"
            value={email}
            onChange={onChange}
          />

          {/* <Link className="btn-in-form" to="/sign-in">
            Sign In
          </Link> */}

          <div className="mt-4">
            <button className="btn-in-form">
              Send Reset Email
            </button>
            </div>
        </form>
      </main>
    </div>
  );
}

export default ForgotPassword;
