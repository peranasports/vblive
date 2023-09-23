import React, { useState, useEffect } from "react";
import PlaylistItem from "./PlaylistItem";

function PlaylistList({ playlists, selItem, onItemSelected, onCommentClicked }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [, forceUpdate] = useState(0);

  const doSelectItem = (pl) => {
    setSelectedItem(pl);
    onItemSelected(pl);
    forceUpdate((n) => !n);
  };

  const doCommentClicked = (pl) => {
    onCommentClicked(pl);
  }

  useEffect(() => {
    if (selItem !== null) {
      setSelectedItem(selItem);
      const elem = document.activeElement;
      if (elem) {
        elem?.blur();
      }
      const idx = playlists.indexOf(selItem);
      const element = document.getElementById(idx);
      if (element) {
        // 👇 Will scroll smoothly to the top of the next section
        element.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "start",
        });
      }
      forceUpdate((n) => !n);
    }
  }, [selItem]);

  return (
    <>
      <div className="flex flex-col">
        {playlists &&
          playlists.map((pl, idx) => (
            <div className="" id={idx} key={idx}>
              <PlaylistItem
                playlist={pl}
                isSelected={pl === selectedItem}
                onItemSelected={(pl) => doSelectItem(pl)}
                onCommentClicked={(pl) => doCommentClicked(pl)}
              />
            </div>
          ))}
      </div>
    </>
  );
}

export default PlaylistList;
