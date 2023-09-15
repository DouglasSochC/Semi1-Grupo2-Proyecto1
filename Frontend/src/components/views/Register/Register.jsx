import React, { useState } from 'react'
import { Grid, Container, Paper, Avatar, Typography, TextField, Button, CssBaseline } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import fondo from './fondo.jpg'
import { LockOutlined as LockOutlinedIcon } from '@material-ui/icons'
import axios from 'axios'
import { useHistory } from 'react-router'

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
}))

/**
 * Formulario de login
 * JSON
 * Formato de body para del registro de usuarios
     * {
	"correo": "admin@gmail.com",
	"contrasenia": "123",
	"nombres": "Nombre usuario 1",
	"apellidos": "Apellido usuario 1",
	"foto": "foto_usuario_1",
	"fecha_nacimiento": "2023-01-01",
	"es_administrador": true
}
     
 * @returns {JSX.Element}
 */
const Login = () => {
    const [body, setBody] = useState({ nombres: '', apellidos: '', fecha_nacimiento: '', correo: '', foto: '', contrasenia: '', confirmacion_contrasenia: '' })
    
    const { push } = useHistory()
    const classes = useStyles()

    const inputChange = ({ target }) => {
        const { name, value } = target
        setBody({
            ...body,
            [name]: value
        })
    }

    const onSubmit = () => {
        // Validar que las contraseñas sean iguales
        if (body.contrasenia !== body.confirmacion_contrasenia) {
            alert('Las contraseñas no coinciden')
            return
        }

        axios.post('http://localhost:3000/usuarios/register', body)
            .then(({ data }) => {
                alert('Usuario registrado');
                //localStorage.setItem('auth', '"yes"')
                push('/login')
            })
            .catch(({ response }) => {
                console.log(response.data)
            })
    }

    return (
        <Grid container component='main' className={classes.root}>
            <CssBaseline />
            <Container component={Paper} elevation={5} maxWidth='xs' className={classes.container}>
                <div className={classes.div}>
                    
                    <Avatar className={classes.avatar}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component='h1' variant='h5'>Sign Up</Typography>
                    <form className={classes.form}>
                    <TextField
                            fullWidth
                            autoFocus
                            color='primary'
                            margin='normal'
                            variant='outlined'
                            label='Nombres'
                            value={body.nombres}
                            onChange={inputChange}
                            name='nombres'
                        />
                        <TextField
                            fullWidth
                            autoFocus
                            color='primary'
                            margin='normal'
                            variant='outlined'
                            label='Apellidos'
                            value={body.apellidos}
                            onChange={inputChange}
                            name='apellidos'
                        />
                        <TextField
                            fullWidth
                            type='date'
                            color='primary'
                            margin='normal'
                            variant='outlined'
                            label='Fecha de nacimiento'
                            value={body.fecha_nacimiento}
                            onChange={inputChange}
                            name='fecha_nacimiento'
                        />
                        <TextField
                            fullWidth
                            type='email'
                            color='primary'
                            margin='normal'
                            variant='outlined'
                            label='Correo'
                            value={body.correo}
                            onChange={inputChange}
                            name='correo'
                        />
                         <TextField
                            fullWidth
                            type='text'
                            color='primary'
                            margin='normal'
                            variant='outlined'
                            label='Foto'
                            value={body.foto}
                            onChange={inputChange}
                            name='foto'
                        />
                        <TextField
                            fullWidth
                            type='password'
                            color='primary'
                            margin='normal'
                            variant='outlined'
                            label='Contraseña'
                            value={body.contrasenia}
                            onChange={inputChange}
                            name='contrasenia'
                        />
                        <TextField
                            fullWidth
                            type='password'
                            color='primary'
                            margin='normal'
                            variant='outlined'
                            label='Confirmacion Contraseña'
                            value={body.confirmacion_contrasenia}
                            onChange={inputChange}
                            name='confirmacion_contrasenia'
                        />
                        <Button
                            fullWidth
                            variant='contained'
                            color='secondary'
                            className={classes.button}
                            onClick={onSubmit}
                        >
                            Registrase
                        </Button>

                    </form>
                </div>
            </Container>
        </Grid>
    )
}

export default Login
