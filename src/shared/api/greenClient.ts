import axios from "axios";

const GREEN_API_BASE_URL = "https://api.green-api.com";

export const greenClient = axios.create({
  baseURL: GREEN_API_BASE_URL,
});

greenClient.interceptors.request.use((config) => {
  const idInstance = localStorage.getItem("green_id");
  const apiTokenInstance = localStorage.getItem("green_token");

  if (idInstance && apiTokenInstance && config.url) {
    const withoutLeadingSlash = config.url.replace(/^\//, "");
    const [methodPath, queryString] = withoutLeadingSlash.split("?", 2);
    const querySuffix = queryString ? `?${queryString}` : "";
    config.url = `/waInstance${idInstance}/${methodPath}/${apiTokenInstance}${querySuffix}`;
  }

  return config;
});
