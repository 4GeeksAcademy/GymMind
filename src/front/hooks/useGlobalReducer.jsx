import React, { createContext, useContext, useReducer } from "react";
import storeReducer, { initialStore } from "../store";
export const Context = createContext(null);
export const StoreProvider = ({ children }) => {
    const savedUser = JSON.parse(sessionStorage.getItem("user") || "null");
    const savedToken = sessionStorage.getItem("token");
    const [store, dispatch] = useReducer(storeReducer, {
        ...initialStore(),
        user: savedUser,
        token: savedToken,
        isAuthenticated: !!savedToken
    });
    return (
        <Context.Provider value={{ store, dispatch }}>
            {children}
        </Context.Provider>
    );
};
const useGlobalReducer = () => {
    return useContext(Context);
};
export default useGlobalReducer;
