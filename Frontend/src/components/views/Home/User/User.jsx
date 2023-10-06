import axios from "axios";
import React, { useState } from "react";
import styled from "styled-components";
import { TextField, Button } from '@material-ui/core'
axios.defaults.baseURL = process.env.REACT_APP_REQUEST_URL;

export default function User({ headerBackground, User, setUsuario }) {

  const [formData, setFormData] = useState({
    nombres: User.nombres,
    apellidos: User.apellidos,
    fecha_nacimiento: User.fecha_nacimiento.substring(0, 10),
    correo: User.correo,
    foto: User.foto,
    contrasenia: '',
    nueva_contrasenia: ''
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFormData({
      ...formData,
      archivo: file
    });
  };

  const onSubmit = () => {
    console.log(formData.contrasenia);
    if (formData.contrasenia !== "") {
      const formDataToSend = new FormData();
      for (const key in formData) {
        formDataToSend.append(key, formData[key]);
      }
      axios
        .put('/usuarios/' + localStorage.getItem('SoundStream_UserID') + '/' + formData.contrasenia, formDataToSend)
        .then(({ data }) => {
          alert(data.mensaje);
          axios.get('/usuario/' + localStorage.getItem('SoundStream_UserID'))
            .then(({ data }) => {
              if (data !== undefined && data !== null) {
                setUsuario(data.usuario)
              }
            })
        })
        .catch(({ response }) => {
          console.log(response.data);
        });
    } else {
      alert("Por favor introduzca su contraseña")
    }

  };

  return (
    <Container headerBackground={headerBackground}>
      <form className="form">
        <img src={`https://multimediasemi1-g2.s3.amazonaws.com/` + User.foto} alt={"imagen de: " + formData.nombres}></img>
        <TextField
          fullWidth
          autoFocus
          color='primary'
          margin='normal'
          variant='outlined'
          label='Nombres'
          name='nombres'
          value={formData.nombres}
          onChange={handleInputChange}
        />
        <TextField
          fullWidth
          autoFocus
          color='primary'
          margin='normal'
          variant='outlined'
          label='Apellidos'
          name='apellidos'
          value={formData.apellidos}
          onChange={handleInputChange}
        />
        <TextField
          InputLabelProps={{ shrink: true }}
          fullWidth
          type='date'
          color='primary'
          margin='normal'
          variant='outlined'
          label='Fecha de nacimiento'
          name='fecha_nacimiento'
          value={formData.fecha_nacimiento}
          onChange={handleInputChange}
        />
        <TextField
          fullWidth
          type='email'
          color='primary'
          margin='normal'
          variant='outlined'
          label='Correo'
          name='correo'
          value={formData.correo}
          onChange={handleInputChange}
        />
        <input
          type='file'
          accept='image/*'
          style={{ display: 'none' }}
          onChange={handleFileChange}
          id='foto-input'
          name='archivo'
        />
        <label htmlFor='foto-input'>
          <Button
            fullWidth
            variant='outlined'
            color='primary'
            component='span'
          >
            Subir Foto
          </Button>
        </label>
        <TextField
          fullWidth
          type='password'
          color='primary'
          margin='normal'
          variant='outlined'
          label='Contraseña'
          name='contrasenia'
          value={formData.contrasenia}
          onChange={handleInputChange}
        />
        <TextField
          fullWidth
          type='password'
          color='primary'
          margin='normal'
          variant='outlined'
          label='Nueva contraseña (opcional)'
          name='nueva_contrasenia'
          value={formData.nueva_contrasenia}
          onChange={handleInputChange}
        />
        <Button
          fullWidth
          variant='contained'
          color='secondary'
          onClick={onSubmit}
        >
          Actualizar
        </Button>
      </form>
    </Container>
  );
}

const Container = styled.div`
  width: 100%; /* Ocupa el 90% del ancho */
  height: 100%; /* Ocupa el 100% del alto disponible */
  margin-top:2.5%;

  img {
    margin: 5px;
    max-width: 15%;
    max-height: 15%;
    object-fit: cover;
  }
  
  form {
    width: 90%; /* Ocupa todo el ancho dentro de Container */
    margin: auto; /* Centra horizontalmente */
    padding: 20px; /* Espaciado interno */
    background-color: rgba(0, 0, 0, 0.5); /* Fondo negro con transparencia */
    display: flex; /* Usar flexbox */
    flex-direction: column; /* Apilar elementos verticalmente */
    justify-content: center; /* Centrar verticalmente */
    align-items: center; /* Centrar horizontalmente */
    .MuiInputLabel-root {
      color: white; /* Cambia el color del texto de las etiquetas a blanco */
    }

    .MuiInputBase-input {
      color: white; /* Cambia el color del texto de los TextField a blanco */
    }
    .MuiButton-label {
      color: white !important; /* Cambia el color del texto del botón a blanco */
    }

    .MuiButton-outlined.MuiButton-outlinedPrimary {
      border-color: white !important; /* Cambia el color del borde a blanco */
    }
  }
  

  button {
    color: white;
    margin-top: 16px; /* Ajusta el margen superior del botón */
  }
`;


