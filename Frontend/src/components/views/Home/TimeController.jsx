import React, { useState, useEffect } from "react";
import styled from "styled-components";

export default function TimeController(props) {
  const [sliderValue, setSliderValue] = useState(props.currentTime);

  useEffect(() => {
    // Update the slider value when currentTime changes
    setSliderValue(props.currentTime);
  }, [props.currentTime]);

  const handleSliderChange = (event) => {
    const newTime = parseFloat(event.target.value);
    setSliderValue(newTime);
    props.CambiarTiempo(newTime);
  };

  return (
    <Container>
      <input
        type="range"
        onMouseUp={handleSliderChange}
        min={0}
        max={props.duration}
        value={sliderValue}
        onChange={handleSliderChange}
      />
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  input {
    width: 100%;
    border-radius: 2rem;
    height: 0.5rem;
    -webkit-appearance: none;
  }
  input[type=range]:focus {
    outline: none;
  }
  input[type=range]::-webkit-slider-runnable-track {
    width: 100%;
    height: 14px;
    cursor: pointer;
    animate: 0.2s;
    box-shadow: 1px 1px 1px #50555C;
    background: #50555C;
    border-radius: 14px;
    border: 0px solid #000000;
  }
  input[type=range]::-webkit-slider-thumb {
    box-shadow: 0px 0px 0px #000000;
    border: 0px solid #000000;
    height: 20px;
    width: 10px;
    border-radius: 12px;
    background: #FFFFFF;
    cursor: pointer;
    -webkit-appearance: none;
    margin-top: -3px;
  }
  input[type=range]:focus::-webkit-slider-runnable-track {
    background: #50555C;
  }
  input[type=range]::-moz-range-track {
    width: 100%;
    height: 14px;
    cursor: pointer;
    animate: 0.2s;
    box-shadow: 1px 1px 1px #50555C;
    background: #50555C;
    border-radius: 14px;
    border: 0px solid #000000;
  }
  input[type=range]::-moz-range-thumb {
    box-shadow: 0px 0px 0px #000000;
    border: 0px solid #000000;
    height: 20px;
    width: 40px;
    border-radius: 12px;
    background: #FFFFFF;
    cursor: pointer;
  }
  input[type=range]::-ms-track {
    width: 100%;
    height: 14px;
    cursor: pointer;
    animate: 0.2s;
    background: transparent;
    border-color: transparent;
    color: transparent;
  }
  input[type=range]::-ms-fill-lower {
    background: #50555C;
    border: 0px solid #000000;
    border-radius: 28px;
    box-shadow: 1px 1px 1px #50555C;
  }
  input[type=range]::-ms-fill-upper {
    background: #50555C;
    border: 0px solid #000000;
    border-radius: 28px;
    box-shadow: 1px 1px 1px #50555C;
  }
  input[type=range]::-ms-thumb {
    margin-top: 1px;
    box-shadow: 0px 0px 0px #000000;
    border: 0px solid #000000;
    height: 20px;
    width: 40px;
    border-radius: 12px;
    background: #FFFFFF;
    cursor: pointer;
  }
  input[type=range]:focus::-ms-fill-lower {
    background: #50555C;
  }
  input[type=range]:focus::-ms-fill-upper {
    background: #50555C;
  }
`;
