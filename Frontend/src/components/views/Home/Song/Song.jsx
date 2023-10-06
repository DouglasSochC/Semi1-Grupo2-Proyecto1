import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { TextField, Button } from '@material-ui/core'
import { useHistory } from 'react-router'
axios.defaults.baseURL = process.env.REACT_APP_REQUEST_URL;

export default function Song({ headerBackground, addToPlayback, play, setSearch }) {

  const playRef = useRef();
  playRef.current = play;

  const { push } = useHistory()

  const [cancion, setCancion] = useState({
    Cancion_Nombre: '',
    Cancion_Archivo_MP3: '',
    Cancion_Duracion: 0,
    Cancion_Fotografia: '',
    Cancion_ID: -1,
    id_album: -1,
    Artista_ID: -1,
    Artista_Nombre: '',
    Album_ID: -1,
    Album_Nombre: ''
  })

  useEffect(() => {
    axios.get('/cancion/' + localStorage.getItem('SoundStream_SongID'))
      .then(({ data }) => {
        if (data !== undefined && data !== null) {
          setCancion(data.cancion)
        } else {
          localStorage.setItem('SoundStream_SongID', -1)
          IrAUsuario();
        }
      })
  }, []);

  const IrAUsuario = () => {
    push('/app')
    setSearch('')
  }

  const VerArtista = () => {
    localStorage.setItem('SoundStream_ArtistID', cancion.Artista_ID)
    push('/artist')
  }

  const VerAlbum = () => {
    localStorage.setItem('SoundStream_AlbumID', cancion.Album_ID)
    push('/album')
  }

  const add = () =>{
    addToPlayback(cancion.Cancion_ID)
  }

  return (
    <Container headerBackground={headerBackground}>
      <div className="form">
        <div className="sides">
          <div className="sides1">
            <img src={cancion.Cancion_Fotografia} alt={"imagen de: " + cancion.Cancion_Nombre}></img>
          </div>
          <div className="sides2">
            <h1><u>Titulo: {cancion.Cancion_Nombre}</u></h1>
            <h2 onClick={VerArtista}>Artista: {cancion.Artista_Nombre}</h2>
            <h2 onClick={VerAlbum}>Album: {cancion.Album_Nombre}</h2>
            <h2>Duracion: {cancion.Cancion_Duracion}</h2>
          </div>
        </div>
        <div className="sides">
          <div className="buttons" onClick={() => {playRef.current(cancion.Cancion_ID)}}>
            Reproducir
          </div>
          <div className="buttons" onClick={add}>
            Agregar a reproduccion actual
          </div>
          <div className="buttons">
            Agregar a playlist
          </div>
          <div className="buttons">
            Agregar a favoritos
          </div>
        </div>
      </div>
    </Container>
  );
}

const Container = styled.div`
  width: 100%; /* Ocupa el 90% del ancho */
  height: 100%; /* Ocupa el 100% del alto disponible */
  margin-top:2.5%;
  color: white;
  .form{
    width: 95%; /* Ocupa todo el ancho dentro de Container */
    margin: auto; /* Centra horizontalmente */
    background-color: rgba(0, 0, 0, 0.5); /* Fondo negro con transparencia */
  }
  .sides {
    display: flex;
    align-items: center;
    justify-content: center;
    display: flex;
    width: 100%;
    align-items: center; /* Centra verticalmente los elementos dentro de sides */
  }
  .sides1 {
    flex: 20%; /* Ocupa el 15% del ancho */
    padding: 10px;
    background-color: rgba(0, 0, 0, 0.1)
  }
  .sides2 {
    flex: 80%; /* Ocupa el 85% del ancho */
    padding: 10px;
  }
  .buttons{
    flex: 25%; /* Ocupa el 33% del ancho */
    background-color: black;
    padding: 10px;
    display: flex;
    justify-content: center; /* Centra horizontalmente */
    align-items: center; /* Centra verticalmente */
    border: 3px solid black;
  }
  .buttons:hover {
    border: 3px solid white;
  }
  img {
    max-width: 100%;
    object-fit: cover;
  }
`;


