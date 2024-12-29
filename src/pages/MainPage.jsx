import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Theme } from "react-daisyui";
import { useAuthStatus } from "../components/hooks/useAuthStatus";
import AppLogo from "../components/assets/VBLive_Logo.png";
import PeranaLogo from "../components/assets/logo512.png";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  TransitionChild,
} from "@headlessui/react";
import {
  Bars3Icon,
  BellIcon,
  CalendarIcon,
  UserCircleIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
  FolderArrowDownIcon,
  TvIcon,
  WifiIcon,
} from "@heroicons/react/24/outline";
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/20/solid";
import Settings from "./Settings";
import Input from "./Input";
import PlaylistsList from "./PlaylistsList";
import MatchesList from "./MatchesList";
import Live from "./Live";
import ThemePicker from "../components/layout/ThemePicker";
import { getAuth } from "firebase/auth";

const navigation = [
  { name: "Matches", index: 0, icon: FolderIcon, current: true },
  { name: "Live", index: 1, icon: WifiIcon, current: true },
  { name: "Import", index: 2, icon: FolderArrowDownIcon, current: false },
  { name: "Play Lists", index: 3, icon: TvIcon, current: false },
];
const teams = [
  //   { id: 1, name: "Heroicons", index: 10, initial: "H", current: false },
  //   { id: 2, name: "Tailwind Labs", index: 11, initial: "T", current: false },
  //   { id: 3, name: "Workcation", index: 12, initial: "W", current: false },
];
const userNavigation = [
  { name: "Your profile", index: 90 },
  { name: "Sign out", index: 99 },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function MainPage() {
  const { firebaseUser } = useAuthStatus();
  const [currentContent, setCurrentContent] = useState(0);
  const [lastContent, setLastContent] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [, forceUpdate] = useState(0);
  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem("theme") ? localStorage.getItem("theme") : "garden"
  );
  const navigate = useNavigate();
  const location = useLocation();
  const coach = location.state;

  const showContents = () => {
    if (!firebaseUser) {
      return <></>;
    }
    for (let i = 0; i < navigation.length; i++) {
      navigation[i].current = i === currentContent;
    }
    if (currentContent === 0)
      return <MatchesList liveMatches={[]} userEmail={firebaseUser.email} />;
    else if (currentContent === 1) return <Live />;
    else if (currentContent === 2) return <Input />;
    else if (currentContent === 3)
      return <PlaylistsList userEmail={firebaseUser.email} />;
    else if (currentContent === 4) return <h1>Calendar</h1>;
    else if (currentContent === 5) return <h1>Documents</h1>;
    else if (currentContent === 6) return <h1>Reports</h1>;
    else if (currentContent === 10) return <h1>Heroicons</h1>;
    else if (currentContent === 11) return <h1>Tailwind Labs</h1>;
    else if (currentContent === 12) return <h1>Workcation</h1>;
    // else if (currentContent === 91) {
    //   // doSelectTheme();
    //   // setLastContent(currentContent);
    //   // return (
    //   //   <Settings onSettingsChange={(settings) => doSettingsChange(settings)} />
    //   // );
    // }
    else if (currentContent === 99) {
      doLogout();
      return <></>;
    }
    return <></>;
  };

  const doContent = (index) => {
    setCurrentContent(index);
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  const doLogout = () => {
    var auth = getAuth();
    auth.signOut();
    navigate("/signin");
  };

  const doSettingsChange = (settings) => {
    setCurrentTheme(settings.theme);
    // document.getElementById("modal-themes").checked = false;
    document.querySelector("html").setAttribute("data-theme", settings.theme);
    setCurrentContent(lastContent);
  };

  const doSelectTheme = () => {
    document.getElementById("modal-themes").checked = true;
  };

  const doThemeChange = (theme) => {
    document.getElementById("modal-themes").checked = false;
    setCurrentTheme(theme);
    document.querySelector("html").setAttribute("data-theme", theme);
  };

  useEffect(() => {
    console.log("Current Content: ", currentContent, currentTheme);
    forceUpdate((n) => !n);
  }, [currentContent, currentTheme]);

  return (
    <>
      <Theme dataTheme={currentTheme}>
        <div className="h-full">
          <Dialog
            open={sidebarOpen}
            onClose={setSidebarOpen}
            className="relative z-50 lg:hidden"
          >
            <DialogBackdrop
              transition
              className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
            />

            <div className="fixed inset-0 flex">
              <DialogPanel
                transition
                className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
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
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-base-100 px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center">
                    <img alt="STARS" src={AppLogo} className="h-8 w-auto" />
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => (
                            <li
                              key={item.name}
                              onClick={() => doContent(item.index)}
                              className="cursor-pointer"
                            >
                              <a
                                className={classNames(
                                  item.current
                                    ? "bg-gray-50 text-indigo-600"
                                    : "text-base-content hover:bg-gray-50 hover:text-indigo-600",
                                  "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
                                )}
                              >
                                <item.icon
                                  aria-hidden="true"
                                  className={classNames(
                                    item.current
                                      ? "text-indigo-600"
                                      : "text-gray-400 group-hover:text-indigo-600",
                                    "size-6 shrink-0"
                                  )}
                                />
                                {item.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </li>
                      {/* <li>
                        <div className="text-xs/6 font-semibold text-gray-400">
                          Your teams
                        </div>
                        <ul role="list" className="-mx-2 mt-2 space-y-1">
                          {teams.map((team) => (
                            <li key={team.name}>
                              <a
                                href={team.href}
                                className={classNames(
                                  team.current
                                    ? "bg-gray-50 text-indigo-600"
                                    : "text-base-content hover:bg-gray-50 hover:text-indigo-600",
                                  "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
                                )}
                              >
                                <span
                                  className={classNames(
                                    team.current
                                      ? "border-indigo-600 text-indigo-600"
                                      : "border-gray-200 text-gray-400 group-hover:border-indigo-600 group-hover:text-indigo-600",
                                    "flex size-6 shrink-0 items-center justify-center rounded-lg border bg-base-100 text-[0.625rem] font-medium"
                                  )}
                                >
                                  {team.initial}
                                </span>
                                <span className="truncate">{team.name}</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </li> */}
                      <li className="mt-auto">
                        <a
                          // onClick={() => doContent(91)}
                          onClick={() => doSelectTheme()}
                          className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-base-content hover:bg-gray-50 hover:text-indigo-600"
                        >
                          <Cog6ToothIcon
                            aria-hidden="true"
                            className="size-6 shrink-0 text-gray-400 group-hover:text-indigo-600"
                          />
                          Settings
                        </a>
                      </li>
                    </ul>
                  </nav>
                </div>
              </DialogPanel>
            </div>
          </Dialog>

          {/* Static sidebar for desktop */}
          <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
            {/* Sidebar component, swap this element with another sidebar if you like */}
            <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-base-100 px-6 pb-4">
              <div className="flex h-16 shrink-0 items-center">
                <img alt="STARS" src={AppLogo} className="h-8 w-auto" />
              </div>
              <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      {navigation.map((item) => (
                        <li
                          key={item.name}
                          onClick={() => doContent(item.index)}
                          className="cursor-pointer"
                        >
                          <a
                            className={classNames(
                              item.current
                                ? "bg-gray-50 text-indigo-600"
                                : "text-base-content hover:bg-gray-50 hover:text-indigo-600",
                              "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
                            )}
                          >
                            <item.icon
                              aria-hidden="true"
                              className={classNames(
                                item.current
                                  ? "text-indigo-600"
                                  : "text-gray-400 group-hover:text-indigo-600",
                                "size-6 shrink-0"
                              )}
                            />
                            {item.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                  {/* <li>
                    <div className="text-xs/6 font-semibold text-gray-400">
                      Your teams
                    </div>
                    <ul role="list" className="-mx-2 mt-2 space-y-1">
                      {teams.map((team) => (
                        <li key={team.name}>
                          <a
                            href={team.href}
                            className={classNames(
                              team.current
                                ? "bg-gray-50 text-indigo-600"
                                : "text-base-content hover:bg-gray-50 hover:text-indigo-600",
                              "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
                            )}
                          >
                            <span
                              className={classNames(
                                team.current
                                  ? "border-indigo-600 text-indigo-600"
                                  : "border-gray-200 text-gray-400 group-hover:border-indigo-600 group-hover:text-indigo-600",
                                "flex size-6 shrink-0 items-center justify-center rounded-lg border bg-base-100 text-[0.625rem] font-medium"
                              )}
                            >
                              {team.initial}
                            </span>
                            <span className="truncate">{team.name}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li> */}
                  <li className="mt-auto">
                    <a
                      // onClick={() => doContent(91)}
                      onClick={() => doSelectTheme()}
                      className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-base-content hover:bg-gray-50 hover:text-indigo-600"
                    >
                      <Cog6ToothIcon
                        aria-hidden="true"
                        className="size-6 shrink-0 text-gray-400 group-hover:text-indigo-600"
                      />
                      Settings
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          <div className="lg:pl-72">
            <div className="sticky top-0 z-40 lg:mx-auto lg:max-w-7xl lg:px-8">
              <div className="flex h-16 items-center gap-x-4 border-b border-gray-200 bg-base-100 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-0 lg:shadow-none">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="-m-2.5 p-2.5 text-base-content lg:hidden"
                >
                  <span className="sr-only">Open sidebar</span>
                  <Bars3Icon aria-hidden="true" className="size-6" />
                </button>

                {/* Separator */}
                <div
                  aria-hidden="true"
                  className="h-6 w-px bg-gray-200 lg:hidden"
                />

                <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                  <form method="GET" className="grid flex-1 grid-cols-1">
                    <h1 className="text-md mt-3 text-center py-2 font-semibold text-base-content">
                      VBLive
                    </h1>
                    {/* <input
                      name="search"
                      type="search"
                      placeholder="Search"
                      aria-label="Search"
                      className="col-start-1 row-start-1 block size-full bg-base-100 pl-8 text-base text-base-content outline-none placeholder:text-gray-400 sm:text-sm/6"
                    />
                    <MagnifyingGlassIcon
                      aria-hidden="true"
                      className="pointer-events-none col-start-1 row-start-1 size-5 self-center text-gray-400"
                    /> */}
                  </form>
                  <div className="flex items-center gap-x-4 lg:gap-x-6">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
                    >
                      <span className="sr-only">Settings</span>
                      <Cog6ToothIcon
                        aria-hidden="true"
                        className="size-6"
                        // onClick={() => doContent(91)}
                        onClick={() => doSelectTheme()}
                      />
                    </button>

                    {/* <button
                      type="button"
                      className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
                    >
                      <span className="sr-only">View notifications</span>
                      <BellIcon aria-hidden="true" className="size-6" />
                    </button> */}

                    {/* Separator */}
                    <div
                      aria-hidden="true"
                      className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200"
                    />
                    <div className="text-xs font-light">
                      {firebaseUser && firebaseUser.email}
                    </div>
                    {/* Profile dropdown */}
                    <Menu as="div" className="relative">
                      <MenuButton className="-m-1.5 flex items-center p-1.5">
                        <span className="sr-only">Open user menu</span>
                        <div className="avatar size-7">
                          <img
                            alt=""
                            src={PeranaLogo} //{coach.portrait ? coach.portrait : PeranaLogo}
                            className="size-8 rounded-full bg-gray-50 shadow-md"
                          />
                        </div>
                        <span className="hidden lg:flex lg:items-center">
                          <span
                            aria-hidden="true"
                            className="ml-4 text-sm/6 font-semibold text-base-content"
                          >
                            {firebaseUser?.displayName}
                          </span>
                          <ChevronDownIcon
                            aria-hidden="true"
                            className="ml-2 size-5 text-gray-400"
                          />
                        </span>
                      </MenuButton>
                      <MenuItems
                        transition
                        className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-base-100 py-2 shadow-lg ring-1 ring-gray-900/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                      >
                        {userNavigation.map((item) => (
                          <MenuItem key={item.name}>
                            <a
                              // href={item.href}
                              onClick={() => doContent(item.index)}
                              className="block px-3 py-1 text-sm/6 text-base-content data-[focus]:bg-gray-50 data-[focus]:outline-none"
                            >
                              {item.name}
                            </a>
                          </MenuItem>
                        ))}
                      </MenuItems>
                    </Menu>
                  </div>
                </div>
              </div>
            </div>

            <main className="">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {showContents(currentContent)}
              </div>
            </main>
          </div>
        </div>

        <input type="checkbox" id="modal-themes" className="modal-toggle" />
        <div className="modal">
          <div className="modal-box sm:w-10/12 w-full max-w-5xl h-[100vh]">
            <h3 className="mb-4 font-bold text-2xl"></h3>
            <div className="flex flex-col">
              <div>
                <ThemePicker onThemeChange={(th) => doThemeChange(th)} />
              </div>
              <div className="flex justify-end">
                <div className="modal-action">
                  <label
                    htmlFor="modal-themes"
                    className="btn btn-sm btn-info rounded-none"
                  >
                    Close
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Theme>
    </>
  );
}
