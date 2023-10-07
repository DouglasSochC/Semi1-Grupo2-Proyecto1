import React from "react";
import { Drawer, Paper, IconButton, Divider } from "@material-ui/core";
import { useStyles } from "../../../style/style";
import { Menu as MenuIcon } from "@material-ui/icons";
import Logo from "../stream.png";
import { MdHomeFilled, MdSearch } from "react-icons/md";
import { IoLibrary } from "react-icons/io5";

const MainMenu = ({ open, setOpen }) => {
  const classes = useStyles();

  return (
    <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
      <Paper className={classes.paper} elevation={0}>
        <div className={classes.div}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setOpen(false)}
          >
            <MenuIcon />
          </IconButton>
          <img src={Logo} alt="..." className={classes.logo} />
        </div>

        <Divider />
        <ul>
          <li>
            <MdHomeFilled />
            <span>Home</span>
          </li>
          <li>
            <MdSearch />
            <span>Search</span>
          </li>
          <li>
            <IoLibrary />
            <span>Your Library</span>
          </li>
        </ul>
      </Paper>
    </Drawer>
  );
};

export default MainMenu;
