import React, { useState } from 'react';
import { Grid, Container, Paper, Avatar, Typography, TextField, Button, CssBaseline } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import fondo from './fondo.jpg';
import { LockOutlined as LockOutlinedIcon } from '@material-ui/icons';
import axios from 'axios';
import { useHistory } from 'react-router';
axios.defaults.baseURL = process.env.REACT_APP_REQUEST_URL;

const useStyles = makeStyles(theme => ({
    root: {
        backgroundImage: `url(${fondo})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh'
    },
    container: {
        height: '80%',
        marginTop: theme.spacing(10),
        [theme.breakpoints.down(400 + theme.spacing(2) + 2)]: {
            marginTop: 0,
            width: '100%',
            height: '100%'
        }
    },
    div: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.primary.main
    },
    form: {
        width: '100%',
        marginTop: theme.spacing(1)
    },
    button: {
        margin: theme.spacing(3, 0, 2)
    }
}));

const Register = () => {
    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        fecha_nacimiento: '',
        correo: '',
        contrasenia: '',
        confirmacion_contrasenia: ''
    });

    const { push } = useHistory();
    const classes = useStyles();

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
        if (formData.contrasenia !== formData.confirmacion_contrasenia) {
            alert('Las contraseñas no coinciden');
            return;
        }

        const formDataToSend = new FormData();
        for (const key in formData) {
            formDataToSend.append(key, formData[key]);
        }

        axios
            .post('/usuarios/register', formDataToSend)
            .then(({ data }) => {
                alert('Usuario registrado');
                push('/login');
            })
            .catch(({ response }) => {
                console.log(response.data);
            });
    };

    return (
        <Grid container component='main' className={classes.root}>
            <CssBaseline />
            <Container component={Paper} elevation={5} maxWidth='xs' className={classes.container}>
                <div className={classes.div}>
                    <Avatar className={classes.avatar}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component='h1' variant='h5'>
                        Sign Up
                    </Typography>
                    <form className={classes.form}>
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
                                className={classes.button}
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
                            label='Confirmación Contraseña'
                            name='confirmacion_contrasenia'
                            value={formData.confirmacion_contrasenia}
                            onChange={handleInputChange}
                        />
                        <Button
                            fullWidth
                            variant='contained'
                            color='secondary'
                            className={classes.button}
                            onClick={onSubmit}
                        >
                            Registrarse
                        </Button>
                    </form>
                </div>
            </Container>
        </Grid>
    );
};

export default Register;
