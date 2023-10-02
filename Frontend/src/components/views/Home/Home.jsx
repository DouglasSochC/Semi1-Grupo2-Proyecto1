import axios from "axios";
import React, {useState, useEffect} from "react";
//import { Typography } from '@material-ui/core'
import Sidebar from "./Sidebar";
import styled from "styled-components";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Body from "./Body";
import User from "./User/User";
import NavBarUsr from "./User/Navbar";
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { useHistory } from 'react-router'


const Home = () => {
  const [search, setSearch] = useState("");
  const headerBackground = "https://i.imgur.com/2nCt3Sbl.jpg";
  const [usuario, setUsuario] = useState({nombres:'',apellidos:'',foto:'',correo:''})
  const { push } = useHistory()

  useEffect(() => {
    axios.get('/usuario/' + localStorage.getItem('SoundStream_UserID'))
    .then(({ data }) => {
      setUsuario(data.usuario)
    })
  }, []); 

  const Salir = () =>{
    localStorage.setItem('SoundStream_UserID', -1);
    push('/login')
  }

  return (
    <Router>
      <Container>
        <div className="spotify__body">
          <Sidebar />
          <Route path="/app">
            <div className="body" >
              <Navbar search={search} setSearch={setSearch} Salir={Salir} />
              <div className="body__contents">
                <Body headerBackground={headerBackground} search={search}/>
              </div>
            </div>
          </Route>
          <Route path="/user">
            <div className="body" >
              <NavBarUsr search={search} Salir={Salir} />
              <div className="body__contents">
                <User headerBackground={headerBackground}/>
              </div>
            </div>
          </Route>
        </div>
        <div className="spotify__footer">
          <Footer />
        </div>
      </Container>
    </Router>
  );
};

const Container = styled.div`
  max-width: 100%;
  max-height: 100%;
  overflow: hidden;
  display: grid;
  grid-template-rows: 86vh 14vh;
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
