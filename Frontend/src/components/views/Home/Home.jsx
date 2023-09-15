import React from 'react'
//import { Typography } from '@material-ui/core'
import Sidebar from "./Sidebar";
import styled from "styled-components";

const Home = () => {
    return (
        <Container>
          <div className="spotify__body">
            <Sidebar />
        
          </div>
        </Container>
      );
}


const Container = styled.div`
  max-width: 100vw;
  max-height: 100vh;
  overflow: hidden;
  display: grid;
  grid-template-rows: 85vh 15vh;
  .spotify__body {
    display: grid;
    grid-template-columns: 15vw 85vw;
    height: 100%;
    width: 100%;
    background: linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(78,9,121,1) 35%, rgba(0,212,255,1) 100%);
    background-color: rgb(32, 87, 100);
    .body {
      height: 100%;
      width: 100%;
      overflow: auto;
      &::-webkit-scrollbar {
        width: 0.7rem;
        max-height: 2rem;
        &-thumb {
          background-color: rgba(255, 255, 255, 0.6);
        }
      }
    }
  }
`;

/*
const Dashboard = () => {
    return (
        <div>
            <Typography variant='h3'>Bienvenido</Typography>
        </div>
    )
}
*/
export default Home