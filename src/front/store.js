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
}

