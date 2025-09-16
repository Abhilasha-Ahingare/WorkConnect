import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./main.css";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";

import { BrowserRouter } from "react-router-dom";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastContainer } from "react-toastify";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <AuthProvider>
        <NotificationProvider>
          <App />
          {/* <ToastContainer
            position="top-right"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            className="toast-container"
            toastClassName="toast-item"
            bodyClassName="toastBody"
            transition={Bounce}
          />{" "}
          */}
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
