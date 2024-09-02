import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { TrashIcon } from "@heroicons/react/24/outline";
import { myunzip } from "../utils/zip";

function Share({ match, onShare }) {
  const [isPrivateDisabled, setIsPrivateDisabled] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);

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

  const doShare = (share) => {
    if (share) {
      console.log("Sharing with users: ", selectedUsers);
      onShare({ isPublic: isPrivateDisabled, users: selectedUsers });
    } else {
      onShare(null);
    }
  };

  useEffect(() => {
    if (match && match.shared) {
      try {
        setIsPrivateDisabled(match.shared.isPublic);
        setSelectedUsers(match.shared.users);
      } catch (error) {
        setIsPrivateDisabled(true);
        setSelectedUsers([]);
      }
    } else {
      setIsPrivateDisabled(true);
      setSelectedUsers([]);
    }
  }, [match]);

  useEffect(() => {}, [selectedUsers]);

  return (
    <>
      <div className="flex-col">
        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text">Available for everyone</span>
            <input
              type="radio"
              name="radio-10"
              className="radio checked:bg-primary"
              defaultChecked
              onClick={() => setIsPrivateDisabled(true)}
            />
          </label>
        </div>
        <div className="form-control">
          <div className="flex-col">
            <label className="label cursor-pointer">
              <span className="label-text">Available to selected users</span>
              <input
                type="radio"
                name="radio-10"
                className="radio checked:bg-primary"
                //   defaultChecked
                onClick={() => setIsPrivateDisabled(false)}
              />
            </label>
            <div
              aria-disabled={isPrivateDisabled}
              className={
                isPrivateDisabled ? "flex-col is-disabled" : "flex-col"
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
                <button className="btn btn-sm btn-primary rounded-none">
                  Import
                </button>
              </div>
              <div className="flex-col border mt-2 p-2">
                <div className="flex justify-between my-2">
                  <div className="text-base-content text-sm mt-2">
                    Selected users:
                  </div>
                  <button
                    className="btn btn-sm btn-primary rounded-none"
                    onClick={() => doClearAllUsers()}
                  >
                    Clear List
                  </button>
                </div>
                <ul className="w-full h-[20vh] border overflow-auto">
                  {selectedUsers.map((user, idx) => (
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
                          className="w-6 h-6 text-base-content cursor-pointer"
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
      <div className="flex justify-between gap-2 mt-2">
        <div className="">
          <button
            className="btn btn-error btn-sm rounded-none"
            onClick={() => onShare(false)}
          >
            Cancel Share
          </button>
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-primary btn-sm rounded-none"
            onClick={() => onShare(false)}
          >
            Close
          </button>
          <button
            className="btn btn-primary btn-sm rounded-none"
            onClick={() => doShare(true)}
          >
            Share
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
    </>
  );
}

export default Share;
