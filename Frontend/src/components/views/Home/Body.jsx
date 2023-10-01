import axios from "axios";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { AiFillClockCircle } from "react-icons/ai";
axios.defaults.baseURL = process.env.REACT_APP_REQUEST_URL;


export default function Body({ headerBackground }) {
  const [canciones, setCanciones] = useState([]);
  const [artistas, setArtistas] = useState([]);

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
  }, []); // El array vacío [] asegura que esta función se ejecute solo una vez al montar el componente
  
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
        <div class="menu-item">
          <img src="imagen1.jpg" alt="Imagen 1"/>
          <p>Texto 1</p>
        </div>

        <div class="menu-item">
          <img src="imagen2.jpg" alt="Imagen 2"/>
          <p>Texto 2</p>
        </div>

        <div class="menu-item">
          <img src="imagen3.jpg" alt="Imagen 3"/>
          <p>Texto 3</p>
        </div>
      </div>
    </Container>
  );
}

const Container = styled.div`
  h1{
    margin: 0 2rem;
  }
  .menu {
    display: flex;
    align-items: center;
    border-radius: 5px;
    padding: 10px;
    width: 98%;
    margin: 0 auto;
    background-color: rgba(0, 0, 0, 0.2);
  }
  .menu-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 5px;
    margin: 5px;
    width: 20vh; /* Ajusta el tamaño de la imagen según tu preferencia */
  }
  .menu-item img {
    margin: 5px;
    width: 90%;
    height: 90%;
    object-fit: cover;
  }
  .menu-item p {
    margin: 2px;
    color: white;
  }
  .playlist {
    margin: 0 2rem;
    display: flex;
    align-items: center;
    gap: 2rem;
    .image {
      img {
        height: 15rem;
        box-shadow: rgba(0, 0, 0, 0.25) 0px 25px 50px -12px;
      }
    }
    .details {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      color: #e0dede;
      .title {
        color: white;
        font-size: 4rem;
      }
    }
  }
  .list {
    .header-row {
      display: grid;
      grid-template-columns: 0.3fr 3fr 2fr 0.1fr;
      margin: 1rem 0 0 0;
      color: #dddcdc;
      position: sticky;
      top: 15vh;
      padding: 1rem 3rem;
      transition: 0.3s ease-in-out;
      background-color: ${({ headerBackground }) =>
        headerBackground ? "#000000dc" : "none"};
    }
    .tracks {
      margin: 0 2rem;
      display: flex;
      flex-direction: column;
      margin-bottom: 5rem;
      .row {
        padding: 0.5rem 1rem;
        display: grid;
        grid-template-columns: 0.3fr 3.1fr 2fr 0.1fr;
        &:hover {
          background-color: rgba(0, 0, 0, 0.7);
        }
        .col {
          display: flex;
          align-items: center;
          color: #dddcdc;
          img {
            height: 40px;
            width: 40px;
          }
        }
        .detail {
          display: flex;
          gap: 1rem;
          .info {
            display: flex;
            flex-direction: column;
          }
        }
      }
    }
  }
`;
