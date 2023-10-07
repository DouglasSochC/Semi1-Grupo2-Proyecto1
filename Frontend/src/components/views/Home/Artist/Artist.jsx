import axios from "axios";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { TextField, Button } from '@material-ui/core'
import { useHistory } from 'react-router'
axios.defaults.baseURL = process.env.REACT_APP_REQUEST_URL;

export default function Artist({ headerBackground, setSearch }) {

    const { push } = useHistory()

    const [artista, setArtista] = useState({
        Artista_ID: -1,
        Artista_Nombre: '',
        url_imagen: '',
        fecha_nacimiento: ''
    });

    const [albumes, setAlbumes] = useState([]);

    useEffect(() => {
        axios.get('/artista/' + localStorage.getItem('SoundStream_ArtistID'))
            .then(({ data }) => {
                if (data !== undefined && data !== null) {
                    setArtista(data.artista)
                } else {
                    localStorage.setItem('SoundStream_ArtistID', -1)
                    IrAUsuario();
                }
            })
    }, []);

    useEffect(() => {
        axios.get('/albumes-artista/' + localStorage.getItem('SoundStream_ArtistID'))
            .then(response => {
                // Extrae los datos relevantes de la respuesta
                const data = response.data.albumes_artista;
                setAlbumes(data)
            })
            .catch(error => {
                console.error("Error al obtener datos de canciones:", error);
            });
    }, [artista]);

    const IrAUsuario = () => {
        push('/app')
        setSearch('')
    }

    const VerAlbum = (id_cancion) => {
        localStorage.setItem('SoundStream_AlbumID', id_cancion)
        push('/album')
    }

    return (
        <Container headerBackground={headerBackground}>
            <div className="form">
                <div className="sides">
                    <div className="sides1">
                        <img src={artista.url_imagen} alt={"imagen de: " + artista.Artista_Nombre}></img>
                    </div>
                    <div className="sides2">
                        <h1><u>Nombre: {artista.Artista_Nombre}</u></h1>
                        <h2>Fecha de nacimiento: {artista.fecha_nacimiento}</h2>
                    </div>
                </div>
                {albumes.map((album, index) => (
                    <div className={`sides ${index % 2 === 0 ? 'even' : ''} ligth`} key={album.Album_ID} onClick={() => VerAlbum(album.Album_ID)}>
                        <div className="Left">
                            {index + 1}
                        </div>
                        <div className="Rigth">
                            {album.Album_Nombre}
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
    flex: 20%;
    padding: 10px;
    background-color: rgba(0, 0, 0, 0.1)
  }
  .sides2 {
    flex: 80%; 
    padding: 10px;
  }
  .Left{
    flex: 10%; 
    padding: 10px;
    display: flex;
    justify-content: center; /* Centra horizontalmente */
    align-items: center; /* Centra verticalmente */
    border: 1px solid black;
  }
  .Rigth{
    flex: 90%; 
    padding: 10px;
    display: flex;
    justify-content: center; /* Centra horizontalmente */
    align-items: center; /* Centra verticalmente */
    border: 1px solid black;
  }
  .ligth:hover {
    border: 3px solid white;
  }
  img {
    max-width: 100%;
    object-fit: cover;
  }
`;


