import React, { useState } from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon, Bars3Icon } from "@heroicons/react/24/outline";
import HittingChart from "./HittingChart";
import { useNavigate } from "react-router-dom";
import { useAuthStatus } from "../hooks/useAuthStatus";
import { allFilters } from "./AllFilters";
const ResponsiveReactGridLayout = WidthProvider(Responsive);

function HittingChartReport2({ matches, team, selectedGame, selectedTeam }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser } = useAuthStatus();
  const [drawMode, setDrawMode] = useState(0);
  const [currentTeam, setCurrentTeam] = useState(-1);
  const [allEvents, setAllEvents] = useState(null);
  const [events, setEvents] = useState(null);
  const [allOptions, setAllOptions] = useState(allFilters);
  const [init, setInit] = useState(false);
  const [appName, setAppName] = useState("");
  const [, forceUpdate] = useState(0);

  const onBackClick = () => {};
  const doEventsSelected = (evs) => {};

  const selectedRows = () => {
    var rows = [];
    for (var n = 0; n < allOptions.length; n++) {
      var option = allOptions[n];
      if (option.title === "Rotations") {
        for (var ni = 0; ni < option.items.length; ni++) {
          if (option.items[ni].selected) {
            rows.push(option.items[ni].name);
          }
        }
      }
    }
    return rows;
  };

  const doLeftSide = () => {
    return <div className="flex h-[90vh] bg-yellow-400"></div>;
  };

  const doRightSide = () => {
    const doRightSide = () => {
      return (
        <>
          <div className="flex-col">
            <p className="text-sm font-semibold text-base-content/50">
              Click on the zones to view video of attacks
            </p>
            <div className="w-100 h-full cursor-pointer">
              <HittingChart
                matches={matches}
                events={events}
                rows={selectedRows()}
                drawMode={drawMode}
                // onEventsSelected={(evs) => doEventsSelected(evs)}
              />
            </div>
          </div>
        </>
      );
    };
  };

  //   return (
  //     <>
  //       <ResponsiveReactGridLayout
  //         className="layout"
  //         // cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
  //         cols={{ lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }}
  //         rowHeight={30}
  //         allowOverlap={true}
  //         // layouts={layouts}
  //         // onLayoutChange={(layout, layouts) =>
  //         //   this.onLayoutChange(layout, layouts)
  //         // }
  //       >
  //         <div
  //           key="1"
  //           data-grid={{
  //             w: 2,
  //             h: 14,
  //             x: 0,
  //             y: 0,
  //             static: true,
  //             minW: 2,
  //             minH: 3,
  //           }}
  //         >
  //             <div className="flex w-[320px] h-[90vh] bg-yellow-400"></div>
  //         </div>
  //         <div
  //           key="2"
  //           data-grid={{ w: 8, h: 3, x: 4, y: 0, static: true, minW: 2, minH: 3 }}
  //         >
  //             <div className="flex h-[90vh] bg-red-400"></div>
  //             </div>
  //       </ResponsiveReactGridLayout>
  //     </>
  //   );

  return (
    <>
      <div className="">
        <div>
          <Dialog
            open={sidebarOpen}
            onClose={setSidebarOpen}
            className="relative z-50 lg:hidden"
          >
            <DialogBackdrop
              transition
              className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
            />

            <div className="fixed inset-0 inset-y-[180px] flex">
              <DialogPanel
                transition
                className="relative mr-16 flex w-full max-w-[320px] bg-green-400 flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
              >
                <TransitionChild>
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
                    <button
                      type="button"
                      onClick={() => setSidebarOpen(false)}
                      className="-m-2.5 p-2.5"
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon
                        aria-hidden="true"
                        className="size-6 text-white"
                      />
                    </button>
                  </div>
                </TransitionChild>
                {/* Sidebar component, swap this element with another sidebar if you like */}
                <div className="flex grow flex-col bg-base-100">
                  {doLeftSide()}
                </div>
              </DialogPanel>
            </div>
          </Dialog>

          {/* Static sidebar for desktop */}
          <div className="hidden lg:fixed lg:inset-y-[210px] lg:z-50 lg:flex lg:w-[320px] lg:flex-col">
            {/* Sidebar component, swap this element with another sidebar if you like */}
            <div className="flex grow flex-col bg-base-100">{doLeftSide()}</div>
          </div>

          <div className="lg:px-4 lg:ml-72 w-fit">
            <div className="sticky top-0 z-40 lg:mx-auto lg:max-w-7xl lg:px-0">
              <div className="flex h-14 items-center gap-x-4 border-b border-gray-200 bg-base-300 px-2 shadow-sm sm:gap-x-6 sm:px-0 lg:px-2 lg:shadow-none">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="-m-2.5 p-2.5 text-base-content/50 lg:hidden"
                >
                  <span className="sr-only">Open sidebar</span>
                  <Bars3Icon
                    aria-hidden="true"
                    className="size-6 cursor-pointer text-base-content/50 hover:text-base-content/80"
                  />
                </button>

                <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 lg:ml-8">
                  <form
                    action="#"
                    method="GET"
                    className="grid flex-1 grid-cols-1"
                  >
                    {/* <h1 className="text-sm text-center py-2 font-semibold text-gray-900"> */}
                    {/* <div className="flex justify-between">
                      {doItemDetails()}

                      <div className="flex ml-4">
                        <a
                          data-tooltip-id="tt-prev"
                          data-tooltip-content="Previous item"
                        >
                          <button type="button" className="mt-3.5">
                            <span className="sr-only">Navigate Back</span>
                            <ChevronLeftIcon
                              className="size-6 cursor-pointer text-base-content/50 hover:text-base-content/80"
                              onClick={() => moveToItem(-1)}
                            />
                          </button>
                        </a>
                        <Tooltip
                          id="tt-prev"
                          place={"bottom-end"}
                          style={{
                            backgroundColor: "oklch(var(--b3))",
                            color: "oklch(var(--bc))",
                          }}
                        />

                        <a
                          data-tooltip-id="tt-prev"
                          data-tooltip-content="Next item"
                        >
                          <button type="button" className="mt-3.5">
                            <span className="sr-only">Navigate Back</span>
                            <ChevronRightIcon
                              className="size-6 cursor-pointer text-base-content/50 hover:text-base-content/80"
                              onClick={() => moveToItem(1)}
                            />
                          </button>
                        </a>
                        <Tooltip
                          id="tt-prev"
                          place={"bottom-end"}
                          style={{
                            backgroundColor: "oklch(var(--b3))",
                            color: "oklch(var(--bc))",
                          }}
                        />
                      </div>
                    </div> */}
                  </form>
                  <div className="flex items-center gap-x-4 lg:gap-x-6">
                    <button type="button" className="">
                      <span className="sr-only">Navigate Back</span>
                      <XMarkIcon
                        aria-hidden="true"
                        className="size-6 cursor-pointer text-base-content/50 hover:text-base-content/80"
                        onClick={() => onBackClick()}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <main className="py-2">
              <div className="mx-auto max-w-7xl px-1 sm:pl-0 sm:pr-2 lg:pr-2 lg:pl-8">
                {doRightSide()}
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

export default HittingChartReport2;
