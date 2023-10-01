import React, { useState } from 'react'
import { Grid, Container, Paper, Avatar, Typography, TextField, Button, CssBaseline } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import fondo from './fondo.jpg'
import { LockOutlined as LockOutlinedIcon } from '@material-ui/icons'
import axios from 'axios'
import { useHistory } from 'react-router'
axios.defaults.baseURL = process.env.REACT_APP_REQUEST_URL;

const useStyles = makeStyles(theme => ({
    root: {
        backgroundImage: `url(${fondo})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        overflow: 'scroll',
        height: '100vh'
    },
    container: {
        height: '490px',
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

const Login = () => {
    const [body, setBody] = useState({ correo: '', contrasenia: '' })
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
        axios.post('/usuarios/login', body)
            .then(({ data }) => {
                if (data?.success) {
                    localStorage.setItem('auth', '"yes"')
                    const { id_usuario, es_administrador } = data?.extra
                    localStorage.setItem('SoundStream_UserID', id_usuario)
                    if (es_administrador === 1) {
                        push('/app_admin')
                    }
                    push('/app')
                }
                alert(data?.mensaje)
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
                    <Typography component='h1' variant='h5'>Sign In</Typography>
                    <form className={classes.form}>
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
                            className={classes.button}
                            onClick={onSubmit}
                        >
                            Sign In
                        </Button>
                        <Button
                            fullWidth
                            variant='contained'
                            color='secondary'
                            className={classes.button}
                            onClick={() => {
                                push('/register')
                            }}
                        >
                            Sign Up
                        </Button>
                    </form>
                </div>
            </Container>
        </Grid>
    )
}

export default Login
