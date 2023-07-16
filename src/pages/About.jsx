import React from "react";
import VBLiveLogo from "../components/assets/logo512.png";
import PeranaSportsLogo from "../components/assets/PeranaSportsLogo.png";
import { EnvelopeOpenIcon } from "@heroicons/react/24/outline";

function About() {
  const Mailto = ({ email, subject, body, children }) => {
    return (
      <a
        href={`mailto:${email}?subject=${
          encodeURIComponent(subject) || ""
        }&body=${encodeURIComponent(body) || ""}`}
      >
        {children}
      </a>
    );
  };

  const footerYear = new Date().getFullYear();

  return (
    <>
      <div className="flex justify-center">
        <div class="card w-96 bg-base-100 shadow-xl">
          <figure class="px-10 pt-10">
            <img src={VBLiveLogo} alt="" width="100" class="rounded-xl" />
          </figure>
          <div class="card-body items-center text-center">
            <h2 class="card-title">VBLive</h2>
            <p className="text-md">
              Copyright &copy; Perana Sports {footerYear}. All rights reserved.
            </p>
            <p className="text-sm">
              VBLive is free to use right now. However Perana Sports reserves
              the right to charge a subscription fee in due course.
            </p>
            <figure class="px-10 pt-6">
              <img src={PeranaSportsLogo} alt="" width="300" class="" />
            </figure>
            <div class="card-actions mt-6">
              <div className="flex">
                <EnvelopeOpenIcon className="text-md text-success w-10" />
                <Mailto email="chau@peranasports.com" subject="VBLive" body="">
                  <h3 className="text-success align-middle">
                    Querries / suggestions are most welcomed.
                  </h3>
                </Mailto>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default About;
