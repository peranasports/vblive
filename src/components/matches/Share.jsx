import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { TrashIcon } from "@heroicons/react/24/outline";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { saveToPC } from "../utils/Utils";

function Share({ shareStatus, shareUsers, currentTime, onShare }) {
  const [thisShareStatus, setThisShareStatus] = useState(0);
  const [originalUsers, setOriginalUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [, forceUpdate] = useState(0);
  const usersListRef = useRef();

  const doAddUser = () => {
    const email = document.getElementById("email").value;
    if (email !== "") {
      if (selectedUsers.includes(email)) {
        toast.error("User already added");
        return;
      } else {
        setSelectedUsers([...selectedUsers, email]);
        document.getElementById("email").value = "";
      }
    } else {
      toast.error("Please enter a valid email address");
    }
  };

  const doDeleteUser = (user) => {
    setSelectedUsers(selectedUsers.filter((u) => u !== user));
  };

  const doClearAllUsers = () => {
    document.getElementById("modal-clear").checked = true;
  };

  const doSaveShare = () => {
    var s = "";
    if (thisShareStatus === 2) {
      for (var user of selectedUsers) {
        if (s.length > 0) s += ",";
        s += user;
      }
    }
    onShare({
      shareStatus: thisShareStatus,
      shareUsers: s,
    });
  };

  const doShare = (share) => {
    if (share) {
      if (thisShareStatus === 2 && selectedUsers.length === 0) {
        toast.error("Please select at least one user to share with");
        return;
      }
      console.log("Sharing with users: ", selectedUsers);
      doSaveShare();
    } else {
      if (shareStatus !== null && shareStatus !== undefined) {
        if (shareStatus !== thisShareStatus || originalUsers !== selectedUsers) {
          document.getElementById("modal-save-confirm").checked = true;
        } else {
          onShare(null);
        }
      } else {
        onShare(null);
      }
    }
  };

  const doConfirmSave = (save) => {
    document.getElementById("modal-save-confirm").checked = false;
    if (save) {
      doSaveShare();
    } else {
      onShare(null);
    }
  };

  const doDoSaveList = () => {
    const filename = document.getElementById("exportfilename").value;
    if (filename.length === 0) {
      toast.error("Please enter a valid filename");
      return;
    }
    var users = selectedUsers.join("\n");
    var blob = new Blob([users], { type: "text/plain" });
    saveToPC(blob, filename + ".txt");
  };

  const doSaveList = () => {
    document.getElementById("modal-filename").checked = true;
  };

  const handleUsersList = (event) => {
    var url = URL.createObjectURL(event.target.files[0]);
    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
      var users = e.target.result.split("\n");
      var selusers = selectedUsers;
      for (var user of users) {
        if (user.length > 0 && selectedUsers.includes(user) === false) {
          selusers.push(user);
        }
      }
      // setSelectedUsers([...selectedUsers, selusers]);
      setSelectedUsers(selusers);
      forceUpdate((n) => !n);
    };
  };

  useEffect(() => {
    document.getElementById("modal-save-confirm").checked = false;
    if (shareStatus !== null && shareStatus !== undefined) {
      setThisShareStatus(shareStatus);
    } else {
      setThisShareStatus(0);
    }
    if (shareUsers !== null && shareUsers !== undefined) {
      const users = shareUsers ? shareUsers.split(",") : [];
      setOriginalUsers(users);
      setSelectedUsers(users);
    } else {
      setSelectedUsers([]);
    }
  }, [shareStatus, shareUsers, currentTime]);

  useEffect(() => {
    console.log(selectedUsers);
  }, [selectedUsers]);

  return (
    <>
      <div className="flex-col">
        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text">Not Shared</span>
            <input
              type="radio"
              name="radio-0"
              className="radio radio-sm checked:bg-error"
              checked={thisShareStatus === 0}
              onClick={() => setThisShareStatus(0)}
            />
          </label>
        </div>
        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text">Available for everyone</span>
            <input
              type="radio"
              name="radio-0"
              className="radio radio-sm checked:bg-success"
              checked={thisShareStatus === 1}
              onClick={() => setThisShareStatus(1)}
            />
          </label>
        </div>
        <div className="form-control">
          <div className="flex-col">
            <label className="label cursor-pointer">
              <span className="label-text">Available to selected users</span>
              <input
                type="radio"
                name="radio-0"
                className="radio radio-sm checked:bg-warning"
                checked={thisShareStatus === 2}
                onClick={() => setThisShareStatus(2)}
              />
            </label>
            <div
              aria-disabled={thisShareStatus !== 2}
              className={
                thisShareStatus !== 2
                  ? "flex-col mt-4 is-disabled"
                  : "flex-col mt-4"
              }
            >
              <div className="flex gap-2">
                <input
                  id="email"
                  type="text"
                  placeholder="Enter VBLive user email address"
                  className="input input-sm input-bordered w-full rounded-none"
                />
                <button
                  className="btn btn-sm btn-primary rounded-none"
                  onClick={() => doAddUser()}
                >
                  Add
                </button>
                <div>
                  <input
                    type="file"
                    id="selectUsersList"
                    ref={usersListRef}
                    style={{ display: "none" }}
                    onChange={handleUsersList}
                    onClick={(event) => {
                      event.target.value = null;
                    }}
                  />
                  <input
                    type="button"
                    className="btn btn-sm btn-primary rounded-none"
                    value="Import"
                    onClick={() =>
                      document.getElementById("selectUsersList").click()
                    }
                  />
                </div>
                {/* <button className="btn btn-sm btn-primary rounded-none" onClick={() => doImportUsers()}>
                  Import
                </button> */}
              </div>
              <div className="flex-col border mt-2 p-2">
                <div className="flex justify-between my-2">
                  <div className="text-base-content text-sm mt-2">
                    Selected users:
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-sm btn-primary rounded-none"
                      onClick={() => doSaveList()}
                    >
                      Save List
                    </button>
                    <button
                      className="btn btn-sm btn-primary rounded-none"
                      onClick={() => doClearAllUsers()}
                    >
                      Clear List
                    </button>
                  </div>
                </div>
                <ul className="w-full h-[20vh] border overflow-auto">
                  {selectedUsers &&
                    selectedUsers.map((user, idx) => (
                      <li
                        key={user}
                        className={
                          idx % 2 === 0
                            ? "text-base-content text-sm p-2 bg-base-200 bg-opacity-75"
                            : "text-base-content text-sm p-2"
                        }
                      >
                        <div className="flex justify-between">
                          <div>{user}</div>
                          <TrashIcon
                            className="w-5 h-5 text-base-content cursor-pointer"
                            onClick={() => doDeleteUser(user)}
                          />
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-2">
        <div className="flex gap-2">
          <button
            className="btn btn-primary btn-sm rounded-none"
            onClick={() => doShare(false)}
          >
            Close
          </button>
          <button
            className="btn btn-primary btn-sm rounded-none"
            onClick={() => doShare(true)}
          >
            Confirm
          </button>
        </div>
      </div>

      <input type="checkbox" id="modal-clear" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box sm:w-11/12 w-full max-w-5xl h-[24vh] rounded-none">
          <h3 className="mb-4 font-bold text-2xl">Clear Users List</h3>
          <div className="flex flex-col">
            <div>Do you really want to clear all users from list?</div>
            <div className="flex justify-end">
              <div className="modal-action">
                <label
                  htmlFor="modal-clear"
                  className="btn btn-sm btn-info rounded-none"
                >
                  No
                </label>
              </div>
              <div className="modal-action">
                <label
                  htmlFor="modal-clear"
                  className="btn btn-sm btn-info ml-4 rounded-none"
                  onClick={() => setSelectedUsers([])}
                >
                  Yes
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <input type="checkbox" id="modal-save-confirm" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box sm:w-11/12 w-full max-w-5xl h-[24vh] rounded-none">
          <h3 className="mb-4 font-bold text-2xl">Share</h3>
          <div className="flex flex-col">
            <div>Do you want to save changes before closing?</div>
            <div className="flex justify-end">
              <div className="modal-action">
                <label
                  htmlFor="modal-save-confirm"
                  className="btn btn-sm btn-info rounded-none"
                  onClick={() => doConfirmSave(false)}
                >
                  No
                </label>
              </div>
              <div className="modal-action">
                <label
                  htmlFor="modal-save-confirm"
                  className="btn btn-sm btn-info ml-4 rounded-none"
                  onClick={() => doConfirmSave(true)}
                >
                  Yes
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <input type="checkbox" id="modal-filename" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box sm:w-11/12 w-full max-w-5xl h-[24vh] rounded-none">
          <h3 className="mb-4 font-bold text-2xl"></h3>
          <div className="flex flex-col">
            <div className="flex-col text-sm">
              <div>Enter name to save list to:</div>
              <input
                id="exportfilename"
                type="text"
                placeholder="Enter name to save list to"
                className="input input-sm input-bordered w-full rounded-none"
              />
            </div>
            <div className="flex justify-end">
              <div className="modal-action">
                <label
                  htmlFor="modal-filename"
                  className="btn btn-sm btn-info rounded-none"
                >
                  Close
                </label>
              </div>
              <div className="modal-action">
                <label
                  htmlFor="modal-filename"
                  className="btn btn-sm btn-info ml-4 rounded-none"
                  onClick={() => doDoSaveList()}
                >
                  Save
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Share;
