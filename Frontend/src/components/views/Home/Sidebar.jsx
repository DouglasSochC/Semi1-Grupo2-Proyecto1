import React from "react";
import styled from "styled-components";
import { MdHomeFilled} from "react-icons/md";
import { AiFillHeart } from "react-icons/ai";
import { BiSolidBookBookmark, BiSolidRadio, BiSolidPlaylist } from "react-icons/bi";
import {BsCollectionPlayFill} from "react-icons/bs";
//import Playlists from "./Playlists";
export default function Sidebar() {
  return (
    <Container>
      <div className="top__links">
        <div className="logo">
          <img
            src="./images/stream.png"
            alt="Sound Stream"
            width="80%"
          />
        </div>
        <ul>
          <li>
            <MdHomeFilled />
            <span>Home</span>
          </li>
          <li>
            <BsCollectionPlayFill />
            <span>Reproduciendo</span>
          </li>
          <li>
            <BiSolidPlaylist />
            <span>Playlist</span>
          </li>
          <li>
            <AiFillHeart />
            <span>Favorites</span>
          </li>
          <li>
            <BiSolidBookBookmark />
            <span>Historical</span>
          </li>
          <li>
            <BiSolidRadio />
            <span>Radio</span>
          </li>
        </ul>
      </div>
    </Container>
  );
}

const Container = styled.div`
  background-color: black;
  color: #b3b3b3;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  .top__links {
    display: flex;
    flex-direction: column;
    .logo {
      text-align: center;
      
    }
    ul {
      list-style-type: none;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
      li {
        display: flex;
        gap: 1rem;
        cursor: pointer;
        transition: 0.3s ease-in-out;
        &:hover {
          color: white;
        }
      }
    }
  }
`;
