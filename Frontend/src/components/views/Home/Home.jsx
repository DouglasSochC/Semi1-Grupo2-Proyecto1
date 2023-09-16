import React from "react";
//import { Typography } from '@material-ui/core'
import Sidebar from "./Sidebar";
import styled from "styled-components";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Body from "./Body";

const Home = () => {
  const headerBackground = "https://i.imgur.com/2nCt3Sbl.jpg";
  return (
    <Container>
      <div className="spotify__body">
        <Sidebar />
        <div className="body" >
          <Navbar />
          <div className="body__contents">
            <Body headerBackground={headerBackground} />
          </div>
        </div>
      </div>
      <div className="spotify__footer">
        <Footer />
      </div>
    </Container>
  );
};

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
    background: linear-gradient(
      0deg,
      rgba(34, 193, 195, 1) 0%,
      rgba(45, 17, 112, 1) 100%
    );
    background-color: rgb(34, 193, 195);
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
export default Home;
