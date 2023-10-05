import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { TextField, Button } from '@material-ui/core'
import { useHistory} from 'react-router'
axios.defaults.baseURL = process.env.REACT_APP_REQUEST_URL;

export default function Album({ headerBackground, setSearch, playAList, addListToPlayback }) {

  const playAListRef = useRef();
  playAListRef.current = playAList;
  const addListToPlaybackRef = useRef();
  addListToPlaybackRef.current = addListToPlayback;

    const { push } = useHistory()

    const [album, setAlbum] = useState({
        Album_ID: -1,
        Album_Nombre: '',
        Album_Descripcion: '',
        Album_ImagenPortada: '',
        Artista_ID: -1,
        Artista_Nombre: ''
    });

    const [canciones, setCanciones] = useState([]);

    useEffect(() => {
        axios.get('/album/' + localStorage.getItem('SoundStream_AlbumID'))
            .then(({ data }) => {
                if (data !== undefined && data !== null) {
                    setAlbum(data.album)
                } else {
                    localStorage.setItem('SoundStream_AlbumID', -1)
                    IrAUsuario();
                }
            })
    }, [album]);

    useEffect(() => {
        axios.get('/canciones-album/' + localStorage.getItem('SoundStream_AlbumID'))
            .then(response => {
                // Extrae los datos relevantes de la respuesta
                const data = response.data.canciones_album;
                setCanciones(data)
            })
            .catch(error => {
                console.error("Error al obtener datos de canciones:", error);
            });
    }, [canciones]);

    const IrAUsuario = () => {
        push('/app')
        setSearch("")
    }

    const VerArtista = () => {
        localStorage.setItem('SoundStream_ArtistID', album.Artista_ID)
        push('/artist')
    }

    const VerCancion = (id_cancion) => {
        localStorage.setItem('SoundStream_SongID', id_cancion)
        push('/song')
    }

    const ReproducirAlbum = () =>{
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
                    <div className="sides1">
                        <img src={album.Album_ImagenPortada} alt={"imagen de: " + album.Album_Nombre}></img>
                    </div>
                    <div className="sides2">
                        <h1><u>Titulo: {album.Album_Nombre}</u></h1>
                        <h2 onClick={VerArtista}>Artista: {album.Artista_Nombre}</h2>
                        <h2>Descripción: {album.Album_Descripcion}</h2>
                    </div>
                </div>
                <div className="sides">
                    <div className="buttons" onClick={ReproducirAlbum}>
                        Reproducir
                    </div>
                    <div className="buttons" onClick={AgregarAlbum}>
                        Agregar a reproduccion actual
                    </div>
                </div>
                {canciones.map((cancion, index) => (
                    <div className={`sides ${index % 2 === 0 ? 'even' : ''} ligth`} key={cancion.id_cancion} onClick={() => VerCancion(cancion.id_cancion)}>
                        <div className="Left">
                            {index + 1}
                        </div>
                        <div className="Center">
                            {cancion.nombre_cancion}
                        </div>
                        <div className="Rigth">
                            {cancion.duracion_cancion}
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
    flex: 10%; /* Ocupa el 33% del ancho */
    padding: 10px;
    display: flex;
    justify-content: center; /* Centra horizontalmente */
    align-items: center; /* Centra verticalmente */
    border: 1px solid black;
  }
  .Center{
    flex: 80%; /* Ocupa el 33% del ancho */
    padding: 10px;
    display: flex;
    justify-content: center; /* Centra horizontalmente */
    align-items: center; /* Centra verticalmente */
    border: 1px solid black;
  }
  .Rigth{
    flex: 10%; /* Ocupa el 33% del ancho */
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


