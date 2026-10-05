import { createBrowserRouter } from "react-router-dom";
import { BaseLayout } from "@/app/layouts";
import { ROUTES } from "@/shared/config";
import { ChatsPage } from "@/pages/chats";

export const router = createBrowserRouter([
  {
    element: <BaseLayout />,
    children: [
      {
        path: ROUTES.main,
        element: <ChatsPage />,
      },
    ],
  },
]);
