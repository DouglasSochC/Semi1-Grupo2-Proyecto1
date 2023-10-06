import axios from "axios";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { TextField, Button } from '@material-ui/core'
import { useHistory } from 'react-router'
axios.defaults.baseURL = process.env.REACT_APP_REQUEST_URL;

export default function Album({ headerBackground, reproduccion, listaCanciones }) {

    const { push } = useHistory()

    const [canciones, setCanciones] = useState([]);
    const [artistas, setArtistas] = useState([]);
    const [albumes, setAlbumes] = useState([]);

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
        const TempCanciones = []
        for (let i = 0; i < listaCanciones.length; i++) {
            axios.get('/cancion/' + listaCanciones[i])
                .then(({ data }) => {
                    if (data !== undefined && data !== null) {
                        TempCanciones = [...TempCanciones, data.cancion]
                    }
                })
        }
        setCanciones(TempCanciones)
    }, [listaCanciones]);

    return (
        <Container headerBackground={headerBackground}>
            <div className="form">
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
                    <div className={`sides ${cancion.Cancion_ID === reproduccion ? 'now' : index % 2 === 0 ? 'even' : ''} ligth`}>
                        <div className="Left">
                            {index + 1}
                        </div>
                        <div className="Center" key={cancion.id_cancion} onClick={() => VerCancion(cancion.id_cancion)}>
                            {cancion.Cancion_Nombre}
                        </div>
                        <div className="Center" key={cancion.Album_ID} onClick={() => VerAlbum(cancion.Album_ID)}>
                            {cancion.Album_Nombre}
                        </div>
                        <div className="Center" key={cancion.Artista_ID} onClick={() => VerArtista(cancion.Artista_ID)}>
                            {cancion.Artista_Nombre}
                        </div>
                        <div className="Center">
                            {cancion.Cancion_Duracion}
                        </div>
                        <div className="Rigth">
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


