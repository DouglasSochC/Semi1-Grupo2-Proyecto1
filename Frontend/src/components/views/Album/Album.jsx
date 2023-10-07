import React, { useState, useEffect } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import VisibilityIcon from '@material-ui/icons/Visibility';
import BookmarkIcon from '@material-ui/icons/Bookmark';
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from '@material-ui/icons/Add';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import UpdateIcon from '@material-ui/icons/Update';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import Box from '@material-ui/core/Box';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import axios from 'axios';
axios.defaults.baseURL = process.env.REACT_APP_REQUEST_URL;

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const Album = () => {

    /* Variables a utilizar */
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [filePhoto, setFilePhoto] = useState(null);
    const [titleModal, setTitleModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);  // Estado para controlar el modo de edicion
    const [changes, setChanges] = useState(false) 

    /* Para setear el archivo y nombre de la foto a subir */
    const [filenamePhoto, setFilenamePhoto] = useState("");
    const handleFilePhotoUpload = (e) => {
        if (!e.target.files) {
            return;
        }
        const filePhoto = e.target.files[0];
        setFilePhoto(filePhoto);
        const { name } = filePhoto;
        setFilenamePhoto(name);
        setChanges(!changes)
    };

    /* Para setear el id del artista seleccionado */
    const [idArtist, setIdArtist] = useState('');
    const handleChange = (event) => {
        setIdArtist(event.target.value);
        setChanges(!changes)
    };

    /* Para setear el id del album seleccionado */
    const [idAlbum, setIdAlbum] = useState('');
    const handleChangeAlbum = (event) => {
        setIdAlbum(event.target.value);
        setChanges(!changes)
    };

    /* Para el funcionamiento del modal que realiza un registro/modificacion */
    const [open, setOpen] = React.useState(false);
    const handleOpen = (titleModal, isEditMode, id_album = '', nombre_album = '', descripcion = '', id_artista = '') => {
        if (isEditMode) {
            setId(id_album);
            setName(nombre_album);
            setDescription(descripcion);
            setIdArtist(id_artista);
        }
        setTitleModal(titleModal);
        setIsEditMode(isEditMode);  // Actualiza el estado para indicar si estamos en modo de edición
        setOpen(true);
    };
    const handleClose = () => {
        handleClear();
        setOpen(false)
        setChanges(!changes)
    };

    /* FUNCIONALIDAD PARA CARGAR LOS ALBUMES */
    const [albumes, setAlbumes] = useState([]);
    useEffect(() => {

        const fetchData = async () => {
            try {
                const response = await axios.get('/albumes');
                setAlbumes(response.data.albumes);
            } catch (error) {
                console.error('Error al obtener los datos:', error);
            }
        };

        fetchData();
    }, [changes]);

    /* FUNCIONALIDAD PARA CARGAR LOS ARTISTAS */
    const [artists, setArtists] = useState([]);
    useEffect(() => {

        const fetchData = async () => {
            try {
                const response = await axios.get('/artistas');
                setArtists(response.data.artistas); // Actualizar el estado con los datos del endpoint
            } catch (error) {
                console.error('Error al obtener los datos:', error);
            }
        };

        fetchData();
    }, [changes]);

    /* FUNCIONALIDAD DE LA TABLA ALBUM */
    const [tableData, setTableData] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/albumes');
                setTableData(response.data.albumes); // Actualizar el estado con los datos del endpoint
            } catch (error) {
                console.error('Error al obtener los datos:', error);
            }
        };

        fetchData();
    }, [changes]);

    /** FUNCIONALIDAD DEL BOTON DEL DETALLE DE UN ALBUM */
    const [tableSongAdded, setTableSongAdded] = useState([]);
    const [tableSongToAdd, setTableSongToAdd] = useState([]);
    useEffect(() => {
            if (idAlbum !== '') {
                axios.get('/canciones-album/' + idAlbum)
                    .then(response => {
                        setTableSongAdded(response.data.canciones_album);
                    })
                    .catch(error => {
                        console.error('Error al obtener los datos:', error);
                    });

                axios.get('/canciones-artista/' + idAlbum)
                    .then(response => {
                        setTableSongToAdd(response.data.canciones_artista);
                    })
                    .catch(error => {
                        console.error('Error al obtener los datos:', error);
                    });
            }
    }, [changes]);
    ;

    /** FUNCIONALIDAD DEL BOTON DE GUARDADO */
    const handleSave = () => {

        const formData = new FormData();
        formData.append('nombre', name);
        formData.append('descripcion', description);
        formData.append('archivo', filePhoto);
        formData.append('id_artista', idArtist);

        if (name === '') {
            alert("El campo nombre es obligatorio");
        } else if (filePhoto === null) {
            alert("El campo fotografía es obligatorio");
        } else if (idArtist === '') {
            alert("El campo artista es obligatorio");
        } else {
            axios.post('/albumes', formData)
                .then(response => {
                    alert(response.data.mensaje);
                    // Cierra el modal
                    setOpen(false);
                    handleClear();
                    setChanges(!changes)
                })
                .catch(error => {
                    console.error('Error al enviar los datos:', error);
                });
        }

    };

    /* FUNCIONALIDAD DEL BOTON DE ACTUALIZAR */
    const handleEdit = () => {
        const formData = new FormData();
        formData.append('nombre', name);
        formData.append('descripcion', description);
        formData.append('archivo', filePhoto);
        formData.append('id_artista', idArtist);

        if (name === '') {
            alert("El campo nombre es obligatorio");
        } else if (filePhoto === null) {
            alert("El campo fotografía es obligatorio");
        } else if (idArtist === '') {
            alert("El campo artista es obligatorio");
        } else {
            axios.put('/albumes/' + id, formData)
                .then(response => {
                    alert(response.data.mensaje);
                    // Cierra el modal
                    setOpen(false);
                    handleClear();
                    setChanges(!changes)
                })
                .catch(error => {
                    console.error('Error al enviar los datos:', error);
                });
        }
    };

    /* FUNCIONALIDAD DEL BOTON DE ELIMINAR */
    const handleDelete = (id) => {

        let password = prompt("Ingrese una contraseña de administrador para ejecutar la acción");
        if (password === '') {
            alert("La contraseña es obligatoria")
        } else {
            axios.post('/usuarios/password', { contrasenia: password })
                .then(response => {
                    if (response.data.success) {
                        axios.delete('/albumes/' + id)
                            .then(response => {
                                alert(response.data.mensaje);
                                setChanges(!changes)
                            })
                            .catch(error => {
                                console.error('Error al enviar los datos:', error);
                            });
                    } else {
                        alert(response.data.mensaje)
                    }
                })
                .catch(error => {
                    console.error('Error al enviar los datos:', error);
                });
        }
    };

    /* FUNCIONALIDAD PARA LIMPIAR LAS VARIABLES */
    const handleClear = () => {
        setId('');
        setName('');
        setFilePhoto(null);
        setFilenamePhoto('');
        setIdArtist('');
    }

    /* FUNCIONALIDAD PARA ELIMINAR UNA CANCION DE UN ALBUM */
    const handleRemoveSongOfAlbum = (id_cancion) => {
        axios.delete('/canciones-album/' + id_cancion)
            .then(response => {
                alert(response.data.mensaje);
                setChanges(!changes)
            })
            .catch(error => {
                console.error('Error al enviar los datos:', error);
            });
    }

    /* FUNCIONALIDAD PARA AGREGAR UNA CANCION DE UN ALBUM */
    const handleAddSongOfAlbum = (id_cancion) => {

        const data = {
            id_album: idAlbum
        };

        if (idAlbum === '') {
            alert("Debe de seleccionar un álbum");
        } else {
            axios.put('/canciones-album/' + id_cancion, data)
                .then(response => {
                    alert(response.data.mensaje);
                    setChanges(!changes)
                })
                .catch(error => {
                    console.error('Error al enviar los datos:', error);
                });
        }
    }

    return (
        <>
            <Button variant="contained" color="primary" onClick={() => handleOpen("Registrar", false)}><AddIcon />Añadir</Button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        {titleModal}
                    </Typography>
                    <br />
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        <TextField
                            label="Nombre del album"
                            variant="outlined"
                            fullWidth
                            sx={{ my: 1 }}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <br />
                        <br />
                        <TextField
                            label="Descripción"
                            variant="outlined"
                            fullWidth
                            sx={{ my: 1 }}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <br />
                        <br />
                        <Button
                            component="label"
                            variant="outlined"
                            startIcon={<CloudUploadIcon />}
                            sx={{ marginRight: "1rem" }}
                        >
                            Fotografía
                            <input type="file" accept=".png, .jpg, .jpeg" hidden onChange={handleFilePhotoUpload} />
                        </Button>
                        <Box>{filenamePhoto}</Box>
                        <br />
                        <InputLabel id="demo-simple-select-label">Artista</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={idArtist}
                            label="Id"
                            onChange={handleChange}
                        >
                            {artists.map(artist => (
                                <MenuItem key={artist.id} value={artist.id}>
                                    {artist.id} - {artist.nombre}
                                </MenuItem>
                            ))}
                        </Select>
                        <br />
                        <br />
                        {isEditMode ? (
                            <Button variant="contained" color="secondary" onClick={handleEdit}><UpdateIcon />Actualizar</Button>
                        ) : (
                            <Button variant="contained" color="primary" onClick={handleSave}><SaveIcon />Guardar</Button>
                        )}
                    </Typography>
                </Box>
            </Modal>

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell align="right">Nombre</TableCell>
                            <TableCell align="right">Descripción</TableCell>
                            <TableCell align="right">Portada</TableCell>
                            <TableCell align="right">Artista</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            tableData ? (
                                tableData.map((row) => (
                                    <TableRow
                                        key={row.id_album}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">{row.id_album}</TableCell>
                                        <TableCell align="right">{row.nombre_album}</TableCell>
                                        <TableCell align="right">{row.descripcion}</TableCell>
                                        <TableCell align="right"><img src={row.url_imagen} alt="Fotografía" style={{ width: '50px', height: '50px' }} /></TableCell>
                                        <TableCell align="right">{row.nombre_artista}</TableCell>
                                        <TableCell align="right">
                                            <IconButton color="primary" onClick={() => handleOpen("Actualizar", true, row.id_album, row.nombre_album, row.descripcion, row.id_artista)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton color="secondary" onClick={() => handleDelete(row.id_album)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        No hay registros disponibles.
                                    </TableCell>
                                </TableRow>
                            )
                        }
                    </TableBody>
                </Table>
            </TableContainer>

            <br /><br />
            <InputLabel id="demo-simple-select-label">Álbum</InputLabel>
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={idAlbum}
                label="Id"
                onChange={handleChangeAlbum}
            >
                {albumes.map(album => (
                    <MenuItem key={album.id_album} value={album.id_album}>
                        {album.id_album} - {album.nombre_album}
                    </MenuItem>
                ))}
            </Select>
            <br />

            <div style={{ display: 'flex' }}>
                <div style={{ marginRight: '20px' }}>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell align="right">Nombre</TableCell>
                                    <TableCell align="right">Imagen</TableCell>
                                    <TableCell align="right">Duración</TableCell>
                                    <TableCell align="right">Artista</TableCell>
                                    <TableCell align="right">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    tableSongAdded ? (
                                        tableSongAdded.map((row) => (
                                            <TableRow
                                                key={row.id_cancion}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell component="th" scope="row">{row.id_cancion}</TableCell>
                                                <TableCell align="right">{row.nombre_cancion}</TableCell>
                                                <TableCell align="right"><img src={row.url_imagen_cancion} alt="Fotografía" style={{ width: '50px', height: '50px' }} /></TableCell>
                                                <TableCell align="right">{row.duracion_cancion}</TableCell>
                                                <TableCell align="right">{row.nombre_artista}</TableCell>
                                                <TableCell align="right">
                                                    <IconButton color="secondary" onClick={() => handleRemoveSongOfAlbum(row.id_cancion)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center">
                                                No hay registros disponibles.
                                            </TableCell>
                                        </TableRow>
                                    )
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
                <div>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell align="right">Nombre</TableCell>
                                    <TableCell align="right">Descripción</TableCell>
                                    <TableCell align="right">Portada</TableCell>
                                    <TableCell align="right">Artista</TableCell>
                                    <TableCell align="right">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    tableSongToAdd ? (
                                        tableSongToAdd.map((row) => (
                                            <TableRow
                                                key={row.id_cancion}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell component="th" scope="row">{row.id_cancion}</TableCell>
                                                <TableCell align="right">{row.nombre_cancion}</TableCell>
                                                <TableCell align="right"><img src={row.url_imagen_cancion} alt="Fotografía" style={{ width: '50px', height: '50px' }} /></TableCell>
                                                <TableCell align="right">{row.duracion_cancion}</TableCell>
                                                <TableCell align="right">{row.nombre_artista}</TableCell>
                                                <TableCell align="right">
                                                    <IconButton color="primary" onClick={() => handleAddSongOfAlbum(row.id_cancion)}>
                                                        <BookmarkIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center">
                                                No hay registros disponibles.
                                            </TableCell>
                                        </TableRow>
                                    )
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </div>
        </>
    );
}

export default Album;