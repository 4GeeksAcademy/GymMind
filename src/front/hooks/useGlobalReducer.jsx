import React, { createContext, useContext, useReducer } from "react";
import storeReducer, { initialStore } from "../store";

export const Context = createContext(null);

export const StoreProvider = ({ children }) => {
    const [store, dispatch] = useReducer(storeReducer, initialStore());
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
