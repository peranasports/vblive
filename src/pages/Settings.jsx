import React from "react";
import ThemePicker from "../components/layout/ThemePicker";

function Settings({ onSettingsChange }) {
  const doThemeChange = (th) => {
    onSettingsChange({ theme: th });
    // document.getElementById("my-modal-themes").checked = false;
  };

  return (
    <>
      <ThemePicker onThemeChange={(th) => doThemeChange(th)} />
    </>
  );
}

export default Settings;
