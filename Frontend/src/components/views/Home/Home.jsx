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
axios.defaults.baseURL = process.env.REACT_APP_REQUEST_URL;

class Cancion{
  constructor(id, nombre, artista, album, duracion, imagen, audio){
    this.id = id;
    this.nombre = nombre;
    this.artista = artista;
    this.album = album;
    this.duracion = duracion;
    this.imagen = imagen;
    this.audio = audio;
    this.next = null;
    this.prev = null;
  }
}

class ListaCanciones{
  constructor(){
    this.Cabeza = null;
  }

  AgregarCancion(id, nombre, artista, album, duracion, imagen, audio){
    const NuevaCancion = new Cancion(id, nombre, artista, album, duracion, imagen, audio);
    if(this.Cabeza === null){
      this.Cabeza = NuevaCancion;
    }else{
      let aux = this.Cabeza;
      while(aux.next !== null){
        aux = aux.next;
      }
      aux.next = NuevaCancion;
      NuevaCancion.prev = aux;
    }
  }

  EliminarCancion(id){
    let aux = this.Cabeza;
    while(aux !== null){
      if(aux.id === id){
        if(aux.prev === null){
          this.Cabeza = aux.next;
          aux.next.prev = null;
        }else if(aux.next === null){
          aux.prev.next = null;
        }else{
          aux.prev.next = aux.next;
          aux.next.prev = aux.prev;
        }
        break;
      }
      aux = aux.next;
    }
  }

  BuscarCancion(id){
    let aux = this.Cabeza;
    while(aux !== null){
      if(aux.id === id){
        return aux;
      }
      aux = aux.next;
    }
    return null;
  }
}

const Home = () => {
  const [search, setSearch] = useState("");
  const headerBackground = "https://i.imgur.com/2nCt3Sbl.jpg";
  const [usuario, setUsuario] = useState({nombres:'',apellidos:'',foto:'',correo:'', fecha_nacimiento:''})
  const { push } = useHistory()
  const [LCanciones, setLCanciones] = useState(new ListaCanciones())

  useEffect(() => {
    axios.get('/usuario/' + localStorage.getItem('SoundStream_UserID'))
    .then(({ data }) => {
      setUsuario(data.usuario)
    })
  }, [usuario]); 

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
              <Navbar search={search} setSearch={setSearch} Salir={Salir} Name={usuario.nombres} />
              <div className="body__contents">
                <Body headerBackground={headerBackground} search={search}/>
              </div>
            </div>
          </Route>
          <Route path="/user">
            <div className="body" >
              <NavBarUsr search={search} Salir={Salir} />
              <div className="body__contents">
                <User headerBackground={headerBackground} User={usuario}/>
              </div>
            </div>
          </Route>
        </div>
        <div className="spotify__footer">
          <Footer/>
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
  /* ===== Scrollbar CSS ===== */
  /* Firefox */
  * {
    scrollbar-width: auto;
    scrollbar-color: #181818 #ffffff;
  }

  /* Chrome, Edge, and Safari */
  *::-webkit-scrollbar {
    width: 16px;
  }

  *::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
  }

  *::-webkit-scrollbar-thumb {
    background-color: #181818;
    border-radius: 13px;
  }
`;

export default Home;
