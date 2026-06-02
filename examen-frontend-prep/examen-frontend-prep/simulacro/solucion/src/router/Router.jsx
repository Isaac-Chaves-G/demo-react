import { createBrowserRouter } from "react-router";
import Login from "../pages/Login/Login";
import Board from "../pages/Board/Board";
import ProtectedRoute from "../components/ProtectedRoute";

const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  { path: "/login", element: <Login /> },
  {
    element: <ProtectedRoute />,
    children: [{ path: "/dashboard", element: <Board /> }],
  },
]);

export default router;
