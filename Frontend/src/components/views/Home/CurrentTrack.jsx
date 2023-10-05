import React from "react";
import styled from "styled-components";

export default function CurrentTrack({ Cancion_Fotografia, Cancion_Nombre, Artista_Nombre }) {
  return (
    <Container>
      <div className="track">
        <div className="track__image">
          <img src={Cancion_Fotografia} alt="currentPlaying" />
        </div>
        <div className="track__info">
          <h4 className="track__info__name">{Cancion_Nombre}</h4>
          <h6 className="track__info__artists">{Artista_Nombre}</h6>
        </div>
      </div>
    </Container>
  );
}

const Container = styled.div`
  color:white;
  .track {
    display: flex;
    align-items: center;
  }

  .track__image {
    flex: 1;
    max-width: 100px; /* Ajusta el ancho máximo de la imagen según tus necesidades */
  }

  .track__image img {
    width: 100%;
    height: auto;
    padding: 1px;
  }

  .track__info {
    flex: 2;
    padding-left: 10px; /* Espacio entre la imagen y la información de la pista */
  }

  .track__info__name {
    margin: 0; /* Elimina el margen superior e inferior del nombre de la canción */
  }

  @media (max-width: 768px) {
    /* Estilos para pantallas más pequeñas (responsive) */
    .track {
      flex-direction: column; /* Cambia el diseño a una columna en pantallas más pequeñas */
    }
    .track__image {
      max-width: 100%; /* La imagen ocupa todo el ancho en pantallas más pequeñas */
      margin-bottom: 10px; /* Espacio entre la imagen y la información de la pista */
    }
  }
`;