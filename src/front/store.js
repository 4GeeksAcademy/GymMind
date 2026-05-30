export const initialStore = () => {
  return {
    user: null,
    token: null,
    isAuthenticated: false
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "login":
      return {
        ...store,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: true
      };

    case "logout":
      return {
        ...store,
        token: null,
        user: null,
        isAuthenticated: false
      };

    default:
      throw Error("Unknown action.");
  }
<<<<<<< HEAD
} 
=======
}

>>>>>>> 605d260fb33cd029f8725a9ce95175d4c6f61f1d
