import axios from "axios";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { TextField, Button } from '@material-ui/core'
import { useHistory } from 'react-router'
axios.defaults.baseURL = process.env.REACT_APP_REQUEST_URL;

export default function Album({ headerBackground, reproduccion, changeSong }) {

  const { push } = useHistory()

  const [canciones, setCanciones] = useState([]);
  const [artistas, setArtistas] = useState([]);
  const [albumes, setAlbumes] = useState([]);
  const [historial, setHistorial] = useState([]);

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
    axios.get('/top5-canciones/' + localStorage.getItem('SoundStream_UserID'))
      .then(({ data }) => {
        if (data !== undefined && data !== null) {
          setCanciones(data.data)
        }
      })
  }, [changeSong]);

  useEffect(() => {
    axios.get('/top3-artistas/' + localStorage.getItem('SoundStream_UserID'))
      .then(({ data }) => {
        if (data !== undefined && data !== null) {
          setArtistas(data.data)
        }
      })
  }, [changeSong]);

  useEffect(() => {
    axios.get('/top5-albumes/' + localStorage.getItem('SoundStream_UserID'))
      .then(({ data }) => {
        if (data !== undefined && data !== null) {
          setAlbumes(data.data)
        }
      })
  }, [changeSong]);

  useEffect(() => {
    axios.get('/historial/' + localStorage.getItem('SoundStream_UserID'))
      .then(({ data }) => {
        if (data !== undefined && data !== null) {
          setHistorial(data.data)
        }
      })
  }, [changeSong]);

  return (
    <Container headerBackground={headerBackground}>
      <div className="aux">
        <h1>Tus 5 canciones mas reproducidos:</h1>
      </div>
      <div className="form">
        <div className={`sides`}>
          <div className="Left">
            No.
          </div>
          <div className="Center">
            Nombre
          </div>
          <div className="Center">
            Artista
          </div>
          <div className="Center">
            Album
          </div>
          <div className="Rigth">
            Reproducciones
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
            <div className="Center" key={cancion.id_artista} onClick={() => VerArtista(cancion.id_artista)}>
              {cancion.nombre_artista}
            </div>
            <div className="Center" key={cancion.id_album} onClick={() => VerAlbum(cancion.id_album)}>
              {cancion.nombre_album}
            </div>
            <div className="Rigth">
              {cancion.cantidad}
            </div>
          </div>
        ))}
      </div>

      <div className="aux">
        <h1>Tus 3 artistas mas reproducidos:</h1>
      </div>
      <div className="form">
        <div className={`sides`}>
          <div className="LeftArtist">
            No.
          </div>
          <div className="CenterArtist">
            Nombre
          </div>
          <div className="RigthArtist">
            Reproducciones
          </div>
        </div>
        {artistas.map((artista, index) => (
          <div className={`sides ${index % 2 === 0 ? 'even' : ''} ligth`}>
            <div className="LeftArtist">
              {index + 1}
            </div>
            <div className="CenterArtist" key={artista.id_artista} onClick={() => VerArtista(artista.id_artista)}>
              {artista.nombre_artista}
            </div>
            <div className="RigthArtist">
              {artista.cantidad}
            </div>
          </div>
        ))}
      </div>

      <div className="aux">
        <h1>Tus 5 albumes mas reproducidos:</h1>
      </div>
      <div className="form">
        <div className={`sides`}>
          <div className="LeftAlbum">
            No.
          </div>
          <div className="CenterAlbum">
            Nombre
          </div>
          <div className="CenterAlbum">
            Artista
          </div>
          <div className="RigthAlbum">
            Reproducciones
          </div>
        </div>
        {albumes.map((album, index) => (
          <div className={`sides ${index % 2 === 0 ? 'even' : ''} ligth`}>
            <div className="LeftAlbum">
              {index + 1}
            </div>
            <div className="CenterAlbum" key={album.id_album} onClick={() => VerAlbum(album.id_album)}>
              {album.nombre_album}
            </div>
            <div className="CenterAlbum" key={album.id_artista} onClick={() => VerArtista(album.id_artista)}>
              {album.nombre_artista}
            </div>
            <div className="RigthAlbum">
              {album.cantidad}
            </div>
          </div>
        ))}
      </div>

      <div className="aux">
        <h1>Historial de canciones:</h1>
      </div>
      <div className="form">
        <div className={`sides`}>
          <div className="LeftHistory">
            No.
          </div>
          <div className="CenterHistory">
            Nombre
          </div>
          <div className="CenterHistory">
            Artista
          </div>
          <div className="CenterHistory">
            Album
          </div>
          <div className="RigthHistory">
            Fecha
          </div>
        </div>
        {historial.map((registro, index) => (
          <div className={`sides ${index % 2 === 0 ? 'even' : ''} ligth`}>
            <div className="LeftHistory">
              {index + 1}
            </div>
            <div className="CenterHistory" key={registro.id_cancion} onClick={() => VerCancion(registro.id_cancion)}>
              {registro.nombre}
            </div>
            <div className="CenterHistory" key={registro.id_artista} onClick={() => VerArtista(registro.id_artista)}>
              {registro.nombre_artista}
            </div>
            <div className="CenterHistory" key={registro.id_album} onClick={() => VerAlbum(registro.id_album)}>
              {registro.nombre_album}
            </div>
            <div className="RigthHistory">
              {registro.fecha_registro}
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
  .aux{
    width: 95%; /* Ocupa todo el ancho dentro de Container */
    margin: auto; /* Centra horizontalmente */
  }
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
    flex: 50%; 
    background-color: black;
    padding: 10px;
    display: flex;
    justify-content: center; /* Centra horizontalmente */
    align-items: center; /* Centra verticalmente */
    border: 3px solid black;
  }
  .Left{
    flex: 5%; 
    padding: 10px;
    display: flex;
    justify-content: center; /* Centra horizontalmente */
    align-items: center; /* Centra verticalmente */
    border: 1px solid black;
  }
  .Center{
    flex: 28%; 
    padding: 10px;
    display: flex;
    justify-content: center; /* Centra horizontalmente */
    align-items: center; /* Centra verticalmente */
    border: 1px solid black;
  }
  .Rigth{
    flex: 11%; 
    padding: 10px;
    display: flex;
    justify-content: center; /* Centra horizontalmente */
    align-items: center; /* Centra verticalmente */
    border: 1px solid black;
  }

  .LeftArtist{
    flex: 5%; 
    padding: 10px;
    display: flex;
    justify-content: center; /* Centra horizontalmente */
    align-items: center; /* Centra verticalmente */
    border: 1px solid black;
  }
  .CenterArtist{
    flex: 84%; 
    padding: 10px;
    display: flex;
    justify-content: center; /* Centra horizontalmente */
    align-items: center; /* Centra verticalmente */
    border: 1px solid black;
  }
  .RigthArtist{
    flex: 11%; 
    padding: 10px;
    display: flex;
    justify-content: center; /* Centra horizontalmente */
    align-items: center; /* Centra verticalmente */
    border: 1px solid black;
  }

  .LeftAlbum{
    flex: 5%; 
    padding: 10px;
    display: flex;
    justify-content: center; /* Centra horizontalmente */
    align-items: center; /* Centra verticalmente */
    border: 1px solid black;
  }
  .CenterAlbum{
    flex: 42%; 
    padding: 10px;
    display: flex;
    justify-content: center; /* Centra horizontalmente */
    align-items: center; /* Centra verticalmente */
    border: 1px solid black;
  }
  .RigthAlbum{
    flex: 11%; 
    padding: 10px;
    display: flex;
    justify-content: center; /* Centra horizontalmente */
    align-items: center; /* Centra verticalmente */
    border: 1px solid black;
  }

  .LeftHistory{
    flex: 5%; 
    padding: 10px;
    display: flex;
    justify-content: center; /* Centra horizontalmente */
    align-items: center; /* Centra verticalmente */
    border: 1px solid black;
  }
  .CenterHistory{
    flex: 20%; 
    padding: 10px;
    display: flex;
    justify-content: center; /* Centra horizontalmente */
    align-items: center; /* Centra verticalmente */
    border: 1px solid black;
  }
  .RigthHistory{
    flex: 15%; 
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


