import React from "react";
import styled from "styled-components";
import { MdHomeFilled, MdOutlineLibraryMusic } from "react-icons/md";
import { AiFillHeart } from "react-icons/ai";
import { BiSolidBookBookmark, BiSolidRadio, BiSolidPlaylist } from "react-icons/bi";
import { BsCollectionPlayFill, BsFillDiscFill } from "react-icons/bs";
import { FiUsers } from "react-icons/fi";
import { useHistory } from 'react-router'
export default function Sidebar({ isAdmin, setSearch }) {

  const { push } = useHistory()

  const Inicio = () =>{
    push('/app')
    setSearch("")
  }

  const irReproduccion = () =>{
    push('/playing')
  }

  const irCRUDCanciones = () =>{
    push('/CRUDCanciones')
  }

  const irCRUDAlbums = () =>{
    push('/CRUDAlbums')
  }

  const irCRUDArtistas = () =>{
    push('/CRUDArtistas')
  }

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
          <li onClick={Inicio}>
            <MdHomeFilled />
            <span>Home</span>
          </li>
          <li onClick={irReproduccion}>
            <BsCollectionPlayFill />
            <span>Reproduciendo</span>
          </li>
          <li>
            <BiSolidPlaylist />
            <span>Playlists</span>
          </li>
          <li>
            <AiFillHeart />
            <span>Favorites</span>
          </li>
          <li>
            <BiSolidBookBookmark />
            <span>Historico</span>
          </li>
          <li>
            <BiSolidRadio />
            <span>Radio</span>
          </li>
          {isAdmin ? (
            <>
              <li onClick={irCRUDCanciones}>
                <BsFillDiscFill />
                <span>CRUD Canciones</span>
              </li>
              <li onClick={irCRUDAlbums}>
                <MdOutlineLibraryMusic />
                <span>CRUD Album</span>
              </li>
              <li onClick={irCRUDArtistas}>
                <FiUsers />
                <span>CRUD Artistas</span>
              </li>
            </>
          ) : (
            <></>
          )
          }
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
