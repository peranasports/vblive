import axios from "axios";

export async function fetchTranslation(language) {
  const qs = require("qs");
  let data = qs.stringify({
    language: language,
  });

  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url:
      process.env.REACT_APP_VBLIVE_API_URL +
      `/Session/GetTranslationByLanguage/${language}`,
    headers: {},
  };

  var logo = null;
  await axios
    .request(config)
    .then((response) => {
      // console.log(JSON.stringify(response.data));
      logo = response.data;
    })
    .catch((error) => {
      console.log(error);
    });
  return logo;
}

export async function fetchAllTranslations() {
  const qs = require("qs");
  let data = qs.stringify({});

  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: process.env.REACT_APP_VBLIVE_API_URL + "/Session/GetAllTranslations",
    headers: {},
    data: data,
  };

  var translations = null;
  await axios
    .request(config)
    .then((response) => {
      //   console.log(JSON.stringify(response.data));
      translations = response.data;
    })
    .catch((error) => {
      console.log(error);
    });
  return translations;
}

export async function fetchUserSettings(userEmail) {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url:
      process.env.REACT_APP_VBLIVE_API_URL +
      `/Session/GetSettingsByUserEmail/${userEmail}`,
    headers: {},
  };

  var settings = null;
  await axios
    .request(config)
    .then((response) => {
      // console.log(JSON.stringify(response.data));
      settings = response.data;
    })
    .catch((error) => {
      console.log(error);
    });
  return settings;
}

export async function storeUserSettings(userEmail, settings) {
  const qs = require("qs");
  let data = qs.stringify({
    userEmail: userEmail,
    settings: JSON.stringify(settings),
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: process.env.REACT_APP_VBLIVE_API_URL + "/Session/StoreUserSettings",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: data,
  };

  await axios
    .request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });
}
