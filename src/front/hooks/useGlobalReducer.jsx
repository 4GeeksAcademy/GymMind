import React, { createContext, useReducer } from "react";
import storeReducer, { initialStore } from "../store";
import { useContext } from "react";

export const Context = createContext(null);

export const StoreProvider = ({ children }) => {

    const [store, dispatch] = useReducer(
        storeReducer,
        initialStore()
    );

    return (

        <Context.Provider value={{ store, dispatch }}>

            {children}

        </Context.Provider>
    );
};

export default function useGlobalReducer() {
    const { store, dispatch } = useContext(Context);
    return { store, dispatch };
}