import React, { useContext } from "react";
import { Route, Redirect } from "react-router-dom";

import { AuthContext } from "../context/auth";

// this redirects us to homepage if we're logged in and try to go to the register/login pages
function AuthRoute({ component: Component, ...rest }) {
  const context = useContext(AuthContext);

  return (
    // if the user exists, then we'll redirect the user to the homepage, else we'll continue on with the path they clicked (in this case either the login or register pages)
    <Route
      {...rest}
      render={(props) =>
        context.user ? <Redirect to="/" /> : <Component {...props} />
      }
    />
  );
}

export default AuthRoute;
