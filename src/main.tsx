import { createRoot } from "react-dom/client";
import "@/shared/styles/index.scss";
import { App } from "./app/App";
import { Provider } from "react-redux";
import { store } from "@/app/store/store";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <App />
  </Provider>,
);
