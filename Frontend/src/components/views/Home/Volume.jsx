import axios from "axios";
import React from "react";
import styled from "styled-components";

export default function Volume(promps) {
  
  return (
    <Container>
      <input type="range" onMouseUp={(event) => promps.CambiarVolumen(event.target.value)} min={0} max={100} defaultValue={100}/>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: flex-end;
  align-content: center;
  input {
    width: 10rem;
    border-radius: 2rem;
    height: 0.5rem;
    -webkit-appearance: none;
  }
`;
