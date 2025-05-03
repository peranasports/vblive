import React, { useEffect } from "react";

function EventDetailSelector({ items, selectedItem, onSelectionChanged, isDisabled }) {
  const [selItem, setSelItem] = React.useState(selectedItem);

  useEffect(() => {
    setSelItem(selectedItem);
  }, [selectedItem, items]);

  const buttonClassName = (index) => {
    if (isDisabled){
      return selItem === index
      ? "px-2 bg-base-300/50 rounded-md text-base-content/80 text-xs border-none h-8 max-h-8 mb-1 mr-1"
      : "px-2 bg-base-200 rounded-md text-base-content/80 text-xs border-none h-8 max-h-8 mb-1 mr-1";
    }
    else {
      return selItem === index
      ? "px-2 bg-primary/50 rounded-md text-primary-content/80 text-xs border-none hover:bg-primary/80 h-8 max-h-8 mb-1 mr-1"
      : "px-2 bg-base-100 rounded-md text-base-content/80 text-xs border-none hover:bg-base-200/80 h-8 max-h-8 mb-1 mr-1";
    }
  };

  return (
    <>
      <div className="flex gap-2 text-xs font-medium px-1 pt-1 overflow-auto bg-base-300 rounded-md">
        <div className="">
          {items &&
            items.map((item, index) => (
              <button
              key={index}
              className={buttonClassName(index)
                // selItem === index
                //   ? "px-2 bg-primary/50 rounded-md text-primary-content/80 text-xs border-none hover:bg-primary/80 h-8 max-h-8 mb-1 mr-1"
                //   : "px-2 bg-base-100 rounded-md text-base-content/80 text-xs border-none hover:bg-base-200/80 h-8 max-h-8 mb-1 mr-1"
              }
              // style={{
              //   whiteSpace: "word-wrap",
              //   overflow: "hidden",
              //   textOverflow: "ellipsis",
              // }}
              onClick={() => {
                setSelItem(index);
                onSelectionChanged(index);
              }}
              disabled={isDisabled}
            >
              {item?.toUpperCase()}
            </button>

              // <button
              //   key={index}
              //   className={
              //     selItem === index
              //       ? "btn btn-sm bg-primary/50 rounded-md text-primary-content/80 text-xs border-none hover:bg-primary/80 h-8 max-h-8 mb-1 mr-1"
              //       : "btn btn-sm bg-base-300/20 rounded-md text-base-content/80 text-xs border-none hover:bg-base-300/80 h-8 max-h-8 mb-1 mr-1"
              //   }
              //   style={{
              //     whiteSpace: "nowrap",
              //     overflow: "hidden",
              //     textOverflow: "ellipsis",
              //   }}
              //   onClick={() => {
              //     setSelItem(index);
              //     onSelectionChanged(index);
              //   }}
              // >
              //   {item}
              // </button>
            ))}
        </div>
      </div>
    </>
  );
}

export default EventDetailSelector;
