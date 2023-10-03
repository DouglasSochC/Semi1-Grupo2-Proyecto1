import React from "react";
import styled from "styled-components";

import { FaSearch } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { ImExit } from "react-icons/im";
import { useHistory } from 'react-router-dom';
import { Button} from '@material-ui/core'

export default function Navbar({ navBackground, setSearch, Salir, Name }) {

  const history = useHistory();

  const { push } = useHistory()

  const handleChange = (e) => {
    setSearch(e)
  };

  const IrAUsuario = () =>{
    push('/user')
  }

  const getFisrtName = (nombre) => {
    let nombreArr = nombre.split(" ");
    return nombreArr[0];
  }

  return (
    <Container navBackground={navBackground}>
      <div className="search__bar">
        <FaSearch />
        <input type="text" placeholder="Artists, songs, or podcasts" onChange={(e) => handleChange(e.target.value)}/>
      </div>
      <div className="avatar">
        <Button onClick={() => IrAUsuario()}>
          <CgProfile />
          <span>{getFisrtName(Name)}</span>
        </Button>
        <Button onClick={() => Salir()}>
          <ImExit />
          <span>Salir</span>
        </Button>
      </div>

    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 10;
  transition: 0.3s ease-in-out;
  background-color: rgba(0, 0, 0, 0.5);
  background-color: ${({ navBackground }) =>
    navBackground ? "rgba(0,0,0,0.7)" : "none"};
  .search__bar {
    background-color: white;
    width: 30%;
    padding: 0.4rem 1rem;
    border-radius: 2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    input {
      border: none;
      height: 2rem;
      width: 100%;
      &:focus {
        outline: none;
      }
    }
  }
  .avatar {
    background-color: black;
    padding: 0.3rem 0.4rem;
    padding-right: 1rem;
    border-radius: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    Button {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
      color: white;
      font-weight: bold;
      svg {
        font-size: 1.3rem;
        background-color: #282828;
        padding: 0.2rem;
        border-radius: 1rem;
        color: #c7c5c5;
      }
    }
  }
`;
