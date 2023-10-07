import React from "react";
import styled from "styled-components";
import {
  BsFillPlayCircleFill,
  BsFillPauseCircleFill,
} from "react-icons/bs";
import { CgPlayTrackNext, CgPlayTrackPrev } from "react-icons/cg";
import { TbArrowsRight, TbRepeatOff, TbArrowsShuffle2, TbRepeat } from "react-icons/tb";

export default function PlayerControls({playerState, changeState, changeCiclico, changeRandom, ciclico, random, Next, Prev}) {

  return (
    <Container>
      <div className="shuffle">
        {random ? (
          <TbArrowsShuffle2 onClick={changeRandom} />
        ) : (
          <TbArrowsRight onClick={changeRandom} />
        )}
      </div>
      <div className="previous">
        <CgPlayTrackPrev onClick={Prev} />
      </div>
      <div className="state">
        {playerState ? (
          <BsFillPauseCircleFill onClick={changeState} />
        ) : (
          <BsFillPlayCircleFill onClick={changeState} />
        )}
      </div>
      <div className="next">
        <CgPlayTrackNext onClick={Next} />
      </div>
      <div className="repeat">
        {ciclico ? (
          <TbRepeat onClick={changeCiclico} />
        ) : (
          <TbRepeatOff onClick={changeCiclico} />
        )}
      </div>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  svg {
    color: #b3b3b3;
    transition: 0.2s ease-in-out;
    &:hover {
      color: white;
    }
  }
  .state {
    svg {
      color: white;
    }
  }
  .previous,
  .next,
  .state {
    font-size: 2rem;
  }
  .shuffle,
  .repeat {
    font-size: 1rem;
  }

  }
`;