import React, { useReducer } from "react";
import jwtDecode from "jwt-decode";

const initialState = {
  user: null,
};

if (localStorage.getItem("jwtToken")) {
  const decodedToken = jwtDecode(localStorage.getItem("jwtToken"));
  if (decodedToken.exp * 1000 < Date.now()) {
    localStorage.removeItem("jwtToken");
  } else {
    initialState.user = decodedToken;
  }
}

const AuthContext = React.createContext({
  user: null,
  login: (userData) => {},
  logout: () => {},
});

const ACTIONS = {
  LOGIN: "login",
  LOGOUT: "logout",
};

function authReducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOGIN:
      return {
        ...state,
        user: action.payload,
      };
    case ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
      };
    default:
      return state;
  }
}

function AuthProvider(props) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // this changes the data inside of our context and sets the user equal to the logged in user details
  function login(userData) {
    localStorage.setItem("jwtToken", userData.token);
    dispatch({
      type: ACTIONS.LOGIN,
      payload: userData,
    });
  }

  function logout() {
    localStorage.removeItem("jwtToken");
    dispatch({
      type: ACTIONS.LOGOUT,
    });
  }

  return (
    <AuthContext.Provider
      value={{ user: state.user, login, logout }}
      {...props}
    />
  );
}

export { AuthContext, AuthProvider };
