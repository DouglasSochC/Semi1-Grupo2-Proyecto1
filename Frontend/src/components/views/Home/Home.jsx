import axios from "axios";
import React, { useState, useEffect } from "react";
//import { Typography } from '@material-ui/core'
import Sidebar from "./Sidebar";
import styled from "styled-components";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Body from "./Body";
import User from "./User/User";
import NavBarUsr from "./User/Navbar";
import Song from "./Song/Song";
import NavBarGen from "./Song/Navbar";
import Album from "./Album/Album";
import Artist from "./Artist/Artist";
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { useHistory } from 'react-router'
axios.defaults.baseURL = process.env.REACT_APP_REQUEST_URL;
/*
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
*/
const Home = () => {
  const [search, setSearch] = useState("");
  const headerBackground = "https://i.imgur.com/2nCt3Sbl.jpg";
  const [usuario, setUsuario] = useState({ nombres: '', apellidos: '', foto: '', correo: '', fecha_nacimiento: '', es_administrador: 0 })
  const { push } = useHistory()
  const [reproduccion, setReproduccion] = useState(-1);
  const [listaCanciones, setListaCanciones] = useState([]);
  const [listaReproduccion, setListaReproduccion] = useState([]);
  const [ciclico, setCiclico] = useState(false);
  const [random, setRandom] = useState(false);
  const [playerState, setPlayerState] = useState(false);
  //const [LCanciones, setLCanciones] = useState(new ListaCanciones())

  const changeCiclico = () => {
    setCiclico(!ciclico);
  };

  const changeRandom = () => {
    if(!random){
      setListaReproduccion(shuffle(listaReproduccion));
    }else{
      setListaReproduccion(listaCanciones);
    }
    setRandom(!random);
  }

  const shuffle = (array) => {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex > 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    return array;
  }

  const addToPlayback = (id_cancion) => {
    if (listaCanciones.includes(id_cancion)) {
      console.log("sin agregar")
      return;
    }
    setListaCanciones([...listaCanciones, id_cancion]);
    const nuevaListaReproduccion = [...listaReproduccion];
    if (random) {
      // Genera un índice aleatorio dentro de la longitud de la lista
      const randomIndex = Math.floor(Math.random() * (nuevaListaReproduccion.length + 1));
      // Inserta la nueva ID en la posición aleatoria generada
      nuevaListaReproduccion.splice(randomIndex, 0, id_cancion);
    } else {
      // Si no es reproducción aleatoria, simplemente agrega la ID al final
      nuevaListaReproduccion.push(id_cancion);
    }
    // Actualiza el estado de listaReproduccion
    console.log(nuevaListaReproduccion)
    setListaReproduccion(nuevaListaReproduccion);
    if (reproduccion === -1) {
      setReproduccion(id_cancion);
    }
  }

  const Next = () => {
    if (reproduccion === -1) {
      return;
    }
    console.log(listaReproduccion)
    const index = listaReproduccion.indexOf(reproduccion);
    if (index === listaReproduccion.length - 1) {
      setReproduccion(listaReproduccion[0]);
      setPlayerState(ciclico)
    } else {
      setReproduccion(listaReproduccion[index + 1]);
      setPlayerState(true)
    }
  }

  const Prev = () => {
    if (reproduccion === -1) {
      return;
    }
    const index = listaReproduccion.indexOf(reproduccion);
    if (index === 0) {
      setReproduccion(listaReproduccion[listaReproduccion.length - 1]);
      setPlayerState(ciclico)
    } else {
      setReproduccion(listaReproduccion[index - 1]);
      setPlayerState(true)
    }
  }

  const Salir = () => {
    localStorage.setItem('SoundStream_UserID', -1);
    push('/login')
  }

  useEffect(() => {
    axios.get('/usuario/' + localStorage.getItem('SoundStream_UserID'))
      .then(({ data }) => {
        if (data !== undefined && data !== null) {
          setUsuario(data.usuario)
        } else {
          Salir()
        }
      })
  }, [usuario]);
  return (
    <Router>
      <Container>
        <div className="spotify__body">
          <Sidebar isAdmin={usuario.es_administrador} />
          <Route path="/app">
            <div className="body" >
              <Navbar search={search} setSearch={setSearch} Salir={Salir} Name={usuario.nombres} />
              <div className="body__contents">
                <Body headerBackground={headerBackground} search={search} />
              </div>
            </div>
          </Route>
          <Route path="/user">
            <div className="body" >
              <NavBarUsr search={search} Salir={Salir} />
              <div className="body__contents">
                <User headerBackground={headerBackground} User={usuario} />
              </div>
            </div>
          </Route>
          <Route path="/song">
            <div className="body" >
              <NavBarGen search={search} Salir={Salir} Name={usuario.nombres} Type={"Cancion:"}/>
              <div className="body__contents">
                <Song headerBackground={headerBackground} addToPlayback={addToPlayback}/>
              </div>
            </div>
          </Route>
          <Route path="/album">
            <div className="body" >
              <NavBarGen search={search} Salir={Salir} Name={usuario.nombres} Type={"Album:"}/>
              <div className="body__contents">
                <Album headerBackground={headerBackground} addToPlayback={addToPlayback}/>
              </div>
            </div>
          </Route>
          <Route path="/artist">
            <div className="body">
              <NavBarGen search={search} Salir={Salir} Name={usuario.nombres} Type={"Artista:"} />
              <div className="body__contents">
                <Artist headerBackground={headerBackground} />
              </div>
            </div>
          </Route>
        </div>
        <div className="spotify__footer">
          <Footer playerState={playerState} setPlayerState={setPlayerState} changeCiclico={changeCiclico} changeRandom={changeRandom} ciclico={ciclico} random={random} reproduccion={reproduccion} Next={Next} Prev={Prev} listaReproduccion={listaReproduccion}/>
        </div>
      </Container>
    </Router>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: grid;
  grid-template-rows: 87vh 13vh;
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
  .spotify__footer{
    height: 100%;
    width: 100%;
    display: grid;
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
