import React, { useState } from "react";

function LogoSelection({ imageURL, name, onImageURLChange }) {
  const [inputImageURL, setInputImageURL] = useState(imageURL);
  return (
    <>
      <div className="flex-col">
        <label className="text-xs p-2">Enter URL of logo for {name}</label>
        <input
          type="search"
          value={inputImageURL}
          className="input-generic px-2"
          placeholder="URL of logo..."
          onChange={(e) => {
            setInputImageURL(e.target.value);
          }}
        />
        <div className="flex justify-end mt-4">
          <button
            className="btn-in-form mr-4"
            onClick={() => {
              onImageURLChange(null, name);
            }}
          >
            Cancel
          </button>
          <div className="">{" "}</div>
          <button
            className="btn-in-form"
            onClick={() => {
              onImageURLChange(inputImageURL, name);
            }}
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
}

export default LogoSelection;
