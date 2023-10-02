import React, { useState, useEffect } from "react";
import styled from "styled-components";
import CurrentTrack from "./CurrentTrack";
import PlayerControls from "./PlayerControls";
import Volume from "./Volume";
import TimeController from "./TimeController";

export default function Footer() {
  const [song, setSong] = useState(null);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playerState, setPlayerState] = useState(false);
  const [changeTime, setChangeTime] = useState(-1);

  const CambiarVolumen = (e) => {
    if (song != null && song.src !== "" && song) {
      song.volume = e / 100;
    }
  };

  const CambiarTiempo = (e) => {
    if(song != null && song.src !== ""){
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

  useEffect(() => {
    const AudioSrc = "Zelda BOTW - Hyrule Castle Interior.mp3";
    if (AudioSrc !== ""){
      const audio = new Audio(AudioSrc);
      audio.addEventListener("ended", () => {
        console.log("Cancion terminada");
        audio.currentTime = 0;
      });
      audio.addEventListener("timeupdate", () => {
        setTime(audio.currentTime);
        setDuration(audio.duration);
      });
      setSong(audio);
  
      // Cleanup event listeners when component unmounts
      return () => {
        audio.removeEventListener("ended", () => {});
        audio.removeEventListener("timeupdate", () => {});
        audio.pause();
      };
    }
  }, []);

  const changeState = () => {
    if(song != null && song.src !== ""){
      setPlayerState(!playerState);
    }
  };

  return (
    <div>
      <Container2>
        <TimeController CambiarTiempo={CambiarTiempo} currentTime={time} duration={duration}/>
      </Container2>
      <Container>
        <CurrentTrack />
        <PlayerControls playerState={playerState} changeState={changeState} />
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
