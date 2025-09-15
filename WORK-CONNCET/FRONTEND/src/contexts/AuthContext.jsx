import {} from "react";
import api from "../api/api";
import { createContext } from "react";
import { useState } from "react";
import { useEffect } from "react";

const Authcontext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClients] = useState([]);
  const [task, setTask] = useState([]);

  const authorization = `Bearer ${token}`;
  const isLogIn = !!token;

  const StoreToken = (token) => {
    setToken(token);
    localStorage.setItem("token", token);
  };

  const logout = () => {
    setToken("");
    setUser("");
    setClients([]);
    localStorage.removeItem("token");
  };

  const UserAuthentication = async () => {
    try {
      const response = await api.get(`/users/get-all-user`);
      if (response.status === 200) {
        setUser(response.data.users);
      }
    } catch (error) {
      console.log("🚫 Error fetching user:", error);
      setIsLoading(false);
    }
  };

  const getAllClient = async () => {
    try {
      const response = await api.get(`/clients/get-all-client`);
      if (response.status === 200) {
        setClients(response.data.clients);
      }
    } catch (error) {
      console.log("🚫 Error fetching client:", error);
      setIsLoading(false);
    }
  };

  const GetAllTask = async () => {
    try {
      const response = await api.get(`/task/get-all-task`);
      if (response.status === 200) {
        setTask(response.data.tasks);
      }
    } catch (error) {
      console.log("🚫 Error fetching task:", error);
    }
  };
  useEffect(() => {
    if (token) {
      UserAuthentication();
      getAllClient();
      GetAllTask();
    } else {
      logout();
    }
  }, [token]);

  return (
    <Authcontext.Provider
      value={{
        user,
        setUser,
        StoreToken,
        authorization,
        isLoading,
        logout,
        isLogIn,
        client,
        task,
        setTask,
        setClients,
      }}
    >
      {children}
    </Authcontext.Provider>
  );
};
export const UserAuth = () => useContext(Authcontext);
export default Authcontext;
