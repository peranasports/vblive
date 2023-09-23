import React, { useState, useEffect } from "react";
import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/20/solid";

function PlaylistItem({ playlist, isSelected, onItemSelected, onCommentClicked }) {

  const doSelect = () => {
    onItemSelected(playlist);
  };

  const doComment = () => {
    onCommentClicked(playlist);
  };

  useEffect(() => {
  });

  return (
    <>
      <div className="flex flex-col cursor-pointer" onClick={() => doSelect()}>
        <div
          className={
            isSelected
              ? "bg-neutral text-neutral-content"
              : "bg-base-100 text-base-content"
          }
        >
          <p className="text-sm font-bold px-2">
            {playlist.playerName}
          </p>
          <p
            className={
              playlist.eventStringColor !== ""
                ? playlist.eventStringColor
                : "text-sm px-1"
            }
          >
            {playlist.eventString}
          </p>
          <div className="flex justify-between">
            <p
              className="text-xs font-light px-2 mb-2 w-full"
            >
              {playlist.eventSubstring}
            </p>
            {playlist.comment !== undefined ? (
              <ChatBubbleLeftEllipsisIcon
                className="w-6 h-6 text-success"
                onClick={() => doComment()}
              />
            ) : (
              <ChatBubbleLeftEllipsisIcon
                className="w-6 h-6 text-base-content"
                onClick={() => doComment()}
              />
            )}
          </div>
          <div className="bg-base-content h-0.5"></div>
        </div>
      </div>
    </>
  );
}

export default PlaylistItem;
