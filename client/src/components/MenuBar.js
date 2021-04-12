import React, { useState, useContext } from "react";
import { Menu } from "semantic-ui-react";
import { Link } from "react-router-dom";

import { AuthContext } from "../context/auth";

export default function MenuBar() {
  const context = useContext(AuthContext);

  const pathname = window.location.pathname;
  const path = pathname === "/" ? "home" : pathname.substring(1);

  const [activeItem, setActiveItem] = useState(path);

  const handleItemClick = (e, { name }) => setActiveItem(name);

  const menuBar = context.user ? (
    <Menu pointing secondary size="massive" color="red">
      <Menu.Item name={context.user.username} active as={Link} to="/" />
      <Menu.Menu position="right">
        <Menu.Item name="logout" onClick={context.logout} />
      </Menu.Menu>
    </Menu>
  ) : (
    <Menu pointing secondary size="massive" color="red">
      <Menu.Item
        name="home"
        active={activeItem === "home"}
        onClick={handleItemClick}
        // in semantic ui react, 'as' allows this to behave as a different component
        as={Link}
        // this is a prop that gets passed to the Link
        to="/"
      />
      <Menu.Menu position="right">
        <Menu.Item
          name="login"
          active={activeItem === "login"}
          onClick={handleItemClick}
          as={Link}
          to="/login"
        />
        <Menu.Item
          name="register"
          active={activeItem === "register"}
          onClick={handleItemClick}
          as={Link}
          to="/register"
        />
      </Menu.Menu>
    </Menu>
  );

  return menuBar;
}
