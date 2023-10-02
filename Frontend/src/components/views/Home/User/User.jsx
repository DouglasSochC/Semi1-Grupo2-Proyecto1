import axios from "axios";
import React, { useState } from "react";
import styled from "styled-components";
import {TextField, Button} from '@material-ui/core'
axios.defaults.baseURL = process.env.REACT_APP_REQUEST_URL;

export default function User({ headerBackground }) {

  const [body, setBody] = useState({ correo: '', contrasenia: '' })

  const inputChange = ({ target }) => {
    const { name, value } = target
    setBody({
      ...body,
      [name]: value
    })
  }

  return (
    <Container2 headerBackground={headerBackground}>
      <form className="form">
        <TextField
          fullWidth
          autoFocus
          color='primary'
          margin='normal'
          variant='outlined'
          label='correo'
          value={body.correo}
          onChange={inputChange}
          name='correo'
        />
        <TextField
          fullWidth
          type='password'
          color='primary'
          margin='normal'
          variant='outlined'
          label='contrasenia'
          value={body.contrasenia}
          onChange={inputChange}
          name='contrasenia'
        />
        <Button
          fullWidth
          variant='contained'
          color='secondary'
          className="button"
        >
        </Button>
      </form>
    </Container2>
  );
}

const Container2 = styled.div`
  form: {
    width: '100%',
    marginTop: theme.spacing(1)
  }
  button: {
    margin: theme.spacing(3, 0, 2)
  }
  form: {
    padding: 8px;
  }
`;
