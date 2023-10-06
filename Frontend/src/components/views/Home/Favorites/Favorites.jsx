import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { TextField, Button } from '@material-ui/core'
import { useHistory } from 'react-router'
axios.defaults.baseURL = process.env.REACT_APP_REQUEST_URL;

export default function Favorites({ headerBackground , playAList , addListToPlayback}) {

  const { push } = useHistory()

  const [canciones, setCanciones] = useState([]);
  const [change, setChange] = useState(false);

  const playAListRef = useRef();
  playAListRef.current = playAList;
  const addListToPlaybackRef = useRef();
  addListToPlaybackRef.current = addListToPlayback;

  const VerCancion = (id_cancion) => {
    localStorage.setItem('SoundStream_SongID', id_cancion)
    push('/song')
  }

  const VerAlbum = (id_album) => {
    localStorage.setItem('SoundStream_AlbumID', id_album)
    push('/album')
  }

  const VerArtista = (id_artista) => {
    localStorage.setItem('SoundStream_ArtistID', id_artista)
    push('/artist')
  }

  useEffect(() => {
    axios.get('/favoritos/' + localStorage.getItem('SoundStream_UserID'))
      .then(({ data }) => {
        if (data !== undefined && data !== null) {
          setCanciones(data.canciones_favoritas)
        }
      })
  }, [change]);

  const EliminarCancion = (id_cancion) => {
    axios
      .delete('/favoritos/' + id_cancion + '/' + localStorage.getItem('SoundStream_UserID'))
      .then(() => {
        setChange(!change)
      });
  }

  const ReproducirAlbum = () => {
    const ListCanciones = [];
    for (let i = 0; i < canciones.length; i++) {
      ListCanciones.push(canciones[i].id_cancion)
    }
    playAListRef.current(ListCanciones);
  }

  const AgregarAlbum = () => {
    const ListCanciones = [];
    for (let i = 0; i < canciones.length; i++) {
      ListCanciones.push(canciones[i].id_cancion)
    }
    addListToPlaybackRef.current(ListCanciones)
  }

  return (
    <Container headerBackground={headerBackground}>
      <div className="form">
        <div className="sides">
          <div className="buttons" onClick={ReproducirAlbum}>
            Reproducir
          </div>
          <div className="buttons" onClick={AgregarAlbum}>
            Agregar a reproduccion actual
          </div>
        </div>
        <div className={`sides`}>
          <div className="Left">
            No.
          </div>
          <div className="Center">
            Nombre
          </div>
          <div className="Center">
            Album
          </div>
          <div className="Center">
            Artista
          </div>
          <div className="Center">
            Duracion
          </div>
          <div className="Rigth">
            Eliminar
          </div>
        </div>
        {canciones.map((cancion, index) => (
          <div className={`sides ${index % 2 === 0 ? 'even' : ''} ligth`}>
            <div className="Left">
              {index + 1}
            </div>
            <div className="Center" key={cancion.id_cancion} onClick={() => VerCancion(cancion.id_cancion)}>
              {cancion.nombre_cancion}
            </div>
            <div className="Center" key={cancion.id_album} onClick={() => VerAlbum(cancion.id_album)}>
              {cancion.nombre_album}
            </div>
            <div className="Center" key={cancion.id_artista_album} onClick={() => VerArtista(cancion.id_artista_album)}>
              {cancion.nombre_artista}
            </div>
            <div className="Center">
              {cancion.duracion_cancion}
            </div >
            <div className="Rigth" key={cancion.id_cancion} onClick={() => EliminarCancion(cancion.id_cancion)}>
              X
            </div>
          </div>
        ))}
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
  .now {
    background-color: rgba(255, 255, 255, 0.8);
    color:black;
  }
  .even {
    background-color: rgba(0, 0, 0, 0.4);
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
    flex: 50%; /* Ocupa el 33% del ancho */
    background-color: black;
    padding: 10px;
    display: flex;
    justify-content: center; /* Centra horizontalmente */
    align-items: center; /* Centra verticalmente */
    border: 3px solid black;
  }
  .Left{
    flex: 8%; /* Ocupa el 33% del ancho */
    padding: 10px;
    display: flex;
    justify-content: center; /* Centra horizontalmente */
    align-items: center; /* Centra verticalmente */
    border: 1px solid black;
  }
  .Center{
    flex: 21%; /* Ocupa el 33% del ancho */
    padding: 10px;
    display: flex;
    justify-content: center; /* Centra horizontalmente */
    align-items: center; /* Centra verticalmente */
    border: 1px solid black;
  }
  .Rigth{
    flex: 8%; /* Ocupa el 33% del ancho */
    padding: 10px;
    display: flex;
    justify-content: center; /* Centra horizontalmente */
    align-items: center; /* Centra verticalmente */
    border: 1px solid black;
  }
  .buttons:hover {
    border: 3px solid white;
  }
  .ligth:hover {
    border: 3px solid white;
  }
  img {
    max-width: 100%;
    object-fit: cover;
  }
`;


