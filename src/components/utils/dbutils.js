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
