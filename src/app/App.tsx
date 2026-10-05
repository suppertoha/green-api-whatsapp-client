import { RouterProvider } from "react-router-dom";
import { router } from "./router/routerConfig";

export const App = () => {
  return <RouterProvider router={router} />;
};
