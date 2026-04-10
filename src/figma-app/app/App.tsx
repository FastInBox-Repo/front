import { RouterProvider } from "react-router";
import { router } from "./routes";

export default function App() {
  return (
    <div className="fi-route-shell">
      <RouterProvider router={router} />
    </div>
  );
}
