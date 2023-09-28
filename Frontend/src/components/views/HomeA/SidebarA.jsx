import React from "react";
import styled from "styled-components";
import { MdHomeFilled, MdPeople, MdSearch, MdVerifiedUser } from "react-icons/md";
import { IoDisc, IoLibrary } from "react-icons/io5";
//import Playlists from "./Playlists";
export default function Sidebar() {
  return (
    <Container>
      <div className="top__links">
        <div className="logo">
          <img className="logo__img"
            src="./stream.png"
            alt="Sound Stream"
          />
        </div>
        <ul>
          <li>
            <MdPeople />
            <span><a href="http://localhost:3001/artista">Artista</a> </span>
          </li>
          <li>
            <IoLibrary />
            <span> <a href="http://localhost:3001/album">Album</a></span>
          </li>
          <li>
            <IoDisc />
            <span><a href="http://localhost:3001/cancion">Cancion</a></span>
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
  img {
    width=300px; height=200px;
  }
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
