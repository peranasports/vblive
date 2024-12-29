import React, { useState, useEffect } from "react";
import { ChatBubbleLeftEllipsisIcon, StopIcon } from "@heroicons/react/20/solid";
import { ChatBubbleLeftIcon, TrashIcon } from "@heroicons/react/24/outline";

function PlaylistItem({
  playlist,
  isSelected,
  onItemSelected,
  onCommentClicked,
  onItemRemoved,
}) {
  const doSelect = () => {
    onItemSelected(playlist);
  };

  const doComment = () => {
    onCommentClicked(playlist);
  };

  const doDot = (item) => {
    if (item.eventStringColor) {
      return item.eventStringColor + " size-4 sm:size-5";
    } else {
      return "size-4 sm:size-5";
    }
  };

  useEffect(() => {});

  const doEventString = (playlist) => {
    return (
      <>
        <p
          className={
            playlist.eventStringColor !== ""
              ? playlist.eventStringColor + " text-sm px-2"
              : "text-sm px-1"
          }
        >
          {playlist.eventString}
        </p>
      </>
    );
  };

  return (
    <>
      <div className="flex flex-col cursor-pointer" onClick={() => doSelect()}>
        <div
          className={
            isSelected
              ? "bg-base-300 text-base-content"
              : "bg-base-100 text-base-content"
          }
        >
          <p className="text-sm font-bold px-2">{playlist.playerName}</p>
          <div className="flex mb-1 font-bold">
            <StopIcon className={doDot(playlist)} />
            <p className="sm:text-sm text-xs px-2">
              {playlist.eventString}
            </p>
          </div>
          <div className="flex justify-between">
            <p className="text-xs font-light px-2 mb-2 w-full">
              {playlist.eventSubstring}
            </p>
            <div className="flex gap-2 mr-2">
              <TrashIcon
                className="size-6 -mt-1 text-base-content/50"
                onClick={() => onItemRemoved(playlist)}
              />

              {playlist.comment !== undefined ? (
                <ChatBubbleLeftEllipsisIcon
                  className="size-6 -mt-1 text-success"
                  onClick={() => doComment()}
                />
              ) : (
                <ChatBubbleLeftIcon
                  className="size-6 -mt-1 text-base-content/50"
                  onClick={() => doComment()}
                />
              )}
            </div>
          </div>
          <div className="bg-base-content/20 h-0.5"></div>
        </div>
      </div>
    </>
  );
}

export default PlaylistItem;
