import axios from "axios";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
axios.defaults.baseURL = process.env.REACT_APP_REQUEST_URL;


export default function Body({ headerBackground, search }) {
  const [canciones, setCanciones] = useState([]);
  const [artistas, setArtistas] = useState([]);
  const [albumes, setAlbumes] = useState([]);

  let msToMinutesAndSeconds = (ms) => {
    let minutes = Math.floor(ms / 60000);
    let seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
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

  useEffect(() => {
    // Realiza la consulta a la API para obtener los datos de canciones y artistas
    if (search===""){
      axios.get("/canciones")
      .then(response => {
        // Extrae los datos relevantes de la respuesta
        const data = response.data.canciones;
        const formattedCanciones = data.map(item => ({
          id: item.id_cancion,
          nombre: item.nombre_cancion,
          fotografia: (item.url_imagen).substring(44)
        }));
        setCanciones(shuffle(formattedCanciones));
      })
      .catch(error => {
        console.error("Error al obtener datos de canciones:", error);
      });
      axios.get("/artistas")
      .then(response => {
        // Extrae los datos relevantes de la respuesta
        const data = response.data.artistas;
        const formattedArtistas = data.map(item => ({
          id: item.id,
          nombre: item.nombre,
          fotografia: (item.url_imagen).substring(44)
        }));
        setArtistas(shuffle(formattedArtistas));
      })
      .catch(error => {
        console.error("Error al obtener datos de canciones:", error);
      });
      axios.get("/albumes")
      .then(response => {
        // Extrae los datos relevantes de la respuesta
        const data = response.data.albumes;
        const formattedAlbumes = data.map(item => ({
          id: item.id_album,
          nombre: item.nombre_album,
          fotografia: (item.url_imagen).substring(44)
        }));
        setAlbumes(shuffle(formattedAlbumes));
      })
      .catch(error => {
        console.error("Error al obtener datos de canciones:", error);
      });
    }else{
      axios.get("/canciones")
      .then(response => {
        // Extrae los datos relevantes de la respuesta
        const data = response.data.canciones;
        const formattedCanciones = []
        for (let i = 0; i < data.length; i++) {
          if (data[i].nombre_cancion.toLowerCase().includes(search.toLowerCase())){
            formattedCanciones.push({
              id: data[i].id_cancion,
              nombre: data[i].nombre_cancion,
              fotografia: (data[i].url_imagen).substring(44),
              duracion: msToMinutesAndSeconds(data[i].duracion),
              artista: data[i].nombre,
              album: data[i].nombre_album
            })
          }
        }
        setCanciones(formattedCanciones);
      })
      .catch(error => {
        console.error("Error al obtener datos de canciones:", error);
      });
      axios.get("/artistas")
      .then(response => {
        // Extrae los datos relevantes de la respuesta
        const data = response.data.artistas;
        const formattedArtistas = []
        for (let i = 0; i < data.length; i++) {
          if (data[i].nombre.toLowerCase().includes(search.toLowerCase())){
            formattedArtistas.push({
              id: data[i].id,
              nombre: data[i].nombre,
              fotografia: (data[i].url_imagen).substring(44)
            })
          }
        }
        setArtistas(formattedArtistas);
      })
      .catch(error => {
        console.error("Error al obtener datos de canciones:", error);
      });
      axios.get("/albumes")
      .then(response => {
        // Extrae los datos relevantes de la respuesta
        const data = response.data.albumes;
        const formattedAlbumes = []
        for (let i = 0; i < data.length; i++) {
          if (data[i].nombre_album.toLowerCase().includes(search.toLowerCase())){
            formattedAlbumes.push({
              id: data[i].id_album,
              nombre: data[i].nombre_album,
              fotografia: (data[i].url_imagen).substring(44)
            })
          }
        }
        setAlbumes(formattedAlbumes);
      })
    }
  }, [search]); 
  
  return (
    <Container headerBackground={headerBackground}>
      <h1>Canciones</h1>
      <div class="menu">
        {canciones.map(cancion => (
          <div className="menu-item" key={cancion.id}>
            <img src={cancion.fotografia} alt="Imagen 1" />
            <p>{cancion.nombre}</p>
          </div>
        ))}
      </div>
      <h1>Artistas</h1>
      <div class="menu">
        {artistas.map(artista => (
          <div className="menu-item" key={artista.id}>
            <img src={artista.fotografia} alt="Imagen 1" />
            <p>{artista.nombre}</p>
          </div>
        ))}
      </div>
      <h1>Albums</h1>
      <div class="menu">
        {albumes.map(album => (
          <div className="menu-item" key={album.id}>
            <img src={album.fotografia} alt="Imagen 1" />
            <p>{album.nombre}</p>
          </div>
        ))}
      </div>
    </Container>
  );
}

const Container = styled.div`
  h1{
    margin: 0 1rem;
    -webkit-text-stroke: 2px black;
    color: white;
  }
  .menu {
    display: flex;
    align-items: center;
    border-radius: 5px;
    padding: 8px;
    width: 98%;
    margin: 0 auto;
    background-color: rgba(0, 0, 0, 0.2);
    overflow-x: auto; /* Agrega un scroll horizontal si es necesario */
    white-space: nowrap; /* Evita que los elementos se dividan en múltiples líneas */
  }
  .menu-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 5px;
    margin: 0px 10px 0 0px;
    min-width: 20vh; /* Tamaño mínimo */
    max-width: 20vh; /* Tamaño máximo */
    flex: 1; /* Permite la expansión en altura */
  }
  .menu-item img {
    margin: 5px;
    max-width: 90%;
    max-height: 90%;
    object-fit: cover;
  }
  .menu-item p {
    margin: 2px;
    color: white;
    white-space: normal; /* Permite el salto de línea */
    max-lines: 2;
  }

`;
