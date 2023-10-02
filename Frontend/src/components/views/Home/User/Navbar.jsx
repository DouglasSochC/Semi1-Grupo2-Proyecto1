import React from "react";
import styled from "styled-components";

import { MdKeyboardReturn } from "react-icons/md";
import { ImExit } from "react-icons/im";
import { useHistory } from 'react-router'
import { Button} from '@material-ui/core'

export default function NavbarUsr({ navBackground, Salir }) {

  const { push } = useHistory()

  const IrAUsuario = () =>{
    push('/app')
  }

  return (
    <Container navBackground={navBackground}>
      <h1>Perfil</h1>

      <div className="avatar">
        <Button onClick={() => IrAUsuario()}>
          <MdKeyboardReturn />
          <span>Regresar</span>
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
  color: white;
  padding: 0rem 2rem;
  position: sticky;
  top: 0;
  z-index: 10;
  transition: 0.3s ease-in-out;
  background-color: rgba(0, 0, 0, 0.5);
  background-color: ${({ navBackground }) =>
    navBackground ? "rgba(0,0,0,0.7)" : "none"};
  .info {
    font-color: white;
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
