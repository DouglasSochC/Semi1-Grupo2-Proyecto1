import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import CurrentTrack from "./CurrentTrack";
import PlayerControls from "./PlayerControls";
import Volume from "./Volume";
import TimeController from "./TimeController";

export default function Footer({ playerState, setPlayerState, changeCiclico, changeRandom, ciclico, random, reproduccion, Next, Prev }) {
  const [song, setSong] = useState(new Audio());
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [changeTime, setChangeTime] = useState(-1);
  const [reproduccionLocal, setReproduccionLocal] = useState(-1);
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
  });

  const nextRef = useRef();
  nextRef.current = Next;

  const playerStateRef = useRef(playerState);
  playerStateRef.current = playerState;

  const CambiarVolumen = (e) => {
    if (song != null && song.src !== "" && song) {
      song.volume = e / 100;
    }
  };

  const CambiarTiempo = (e) => {
    if (song != null && song.src !== "") {
      setChangeTime(e);
    }
  };

  useEffect(() => {
    if (song != null && song.src !== "" && song) {
      if (playerState) {
        song.play();
      } else {
        song.pause();
      }
    }
  }, [playerState, song]);

  useEffect(() => {
    if (song != null && song.src !== "" && changeTime !== -1) {
      if (song) {
        song.currentTime = changeTime;
        setTime(changeTime);
      }
      setChangeTime(-1);
    }
  }, [changeTime, song]);

  const clearAudioEventListeners = () => {
    song.removeEventListener("canplaythrough", handleCanPlayThrough);
    song.removeEventListener("ended", handleAudioEnded);
    song.removeEventListener("timeupdate", handleTimeUpdate);
  };

  const handleCanPlayThrough = () => {
    if (playerStateRef.current) {
      try {
        // Intenta reproducir el audio
        song.play();
      } catch (error) {
        // Maneja la excepción sin hacer nada (puedes agregar tu lógica aquí si es necesario)
      }
    }
  };
  
  const handleAudioEnded = () => {
    song.currentTime = 0;
    song.pause();
    nextRef.current();
  };
  
  const handleTimeUpdate = () => {
    setTime(song.currentTime);
    setDuration(song.duration);
  };

  useEffect(() => {
    if (reproduccionLocal !== reproduccion && reproduccion !== -1) {
      console.log('/cancion/' + reproduccion);
      axios.get('/cancion/' + reproduccion)
        .then(({ data }) => {
          if (data !== undefined && data !== null) {
            setCancion(data.cancion);
            const AudioSrc = data.cancion.Cancion_Archivo_MP3.substring(44);
            if (AudioSrc !== "") {
              if (song.readyState >= 2) {
                song.pause();
                song.currentTime = 0;
              }
              clearAudioEventListeners();
              song.src = AudioSrc;
              song.addEventListener('canplaythrough', handleCanPlayThrough);
              song.addEventListener("ended", handleAudioEnded);
              song.addEventListener("timeupdate", handleTimeUpdate);
            }
            setReproduccionLocal(reproduccion);
          }
        });
    } else if (reproduccion === -1) {
      song.pause();
      setReproduccionLocal(reproduccion);
    }
    return () => {
      clearAudioEventListeners();
    };
  }, [reproduccion]);
  
  
  

  const changeState = () => {
    if (reproduccionLocal !== -1 && song != null && song.src !== "") {
      setPlayerState(!playerState);
    }
  };

  return (
    <div>
      <Container2>
        <TimeController CambiarTiempo={CambiarTiempo} currentTime={time} duration={duration} />
      </Container2>
      <Container>
        <CurrentTrack />
        <PlayerControls playerState={playerState} changeState={changeState} changeCiclico={changeCiclico} changeRandom={changeRandom} ciclico={ciclico} random={random} Next={Next} Prev={Prev} />
        <Volume CambiarVolumen={CambiarVolumen} />
      </Container>
    </div>
  );
}

const Container = styled.div`
  height: 100%;
  width: 100%;
  background-color: #181818;
  border-top: 1px solid #282828;
  display: grid;
  grid-template-columns: 2fr 2fr 2fr;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
`;

const Container2 = styled.div`
  height: 100%;
  width: 100%;
  background-color: #181818;
  border-top: 1px solid #282828;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
`;
