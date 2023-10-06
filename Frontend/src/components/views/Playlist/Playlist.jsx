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
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from '@material-ui/icons/Add';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import UpdateIcon from '@material-ui/icons/Update';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import Box from '@material-ui/core/Box';
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

const Playlist = () => {

    /* Variables a utilizar */
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [file, setFile] = useState(null);
    const [idUser, setIdUser] = useState(0);
    const [isEditMode, setIsEditMode] = useState(false);  // Estado para controlar el modo de edicion
    const [titleModal, setTitleModal] = useState(false);

    /* Para setear el nombre del archivo a subir */
    const [filename, setFilename] = useState("");
    const handleFileUpload = (e) => {
        if (!e.target.files) {
            return;
        }
        const file = e.target.files[0];
        setFile(file);
        const { name } = file;
        setFilename(name);
    };

    /* Para el modal que realiza un registro */
    const [open, setOpen] = React.useState(false);
    const handleOpen = (titleModal, isEditMode, id = '', nombre = '') => {
        if (isEditMode) {
            setId(id);
            setName(nombre);
        }
        setTitleModal(titleModal);
        setIsEditMode(isEditMode);  // Actualiza el estado para indicar si estamos en modo de edición
        setOpen(true);
    };
    const handleClose = () => {
        handleClear();
        setOpen(false)
    };

    /* FUNCIONALIDAD DE LA TABLA */
    const [artistData, setArtistData] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/playlists');
                setArtistData(response.data.playlists); // Actualizar el estado con los datos del endpoint
            } catch (error) {
                console.error('Error al obtener los datos:', error);
            }
        };

        fetchData();
    }, [artistData]);

    /** FUNCIONALIDAD DEL BOTON DE GUARDADO */
    const handleSave = () => {
        const formData = new FormData();
        formData.append('nombre', name);
        formData.append('archivo', file);
        formData.append('id_usuario', idUser);

        if (name === '') {
            alert("El campo nombre es obligatorio");
        } else if (file === null) {
            alert("El campo fotografía es obligatorio");
        } else {
            axios.post('/playlists', formData)
                .then(response => {
                    alert(response.data.mensaje);
                    setOpen(false);
                    handleClear();
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
        formData.append('archivo', file);

        if (name === '') {
            alert("El campo nombre es obligatorio");
        } else if (file === null) {
            alert("El campo fotografía es obligatorio");
        } else {
            axios.put('/playlists/' + id, formData)
                .then(response => {
                    alert(response.data.mensaje);
                    // Cierra el modal
                    setOpen(false);
                    handleClear();
                })
                .catch(error => {
                    console.error('Error al enviar los datos:', error);
                });
        }

    };

    /* FUNCIONALIDAD DEL BOTON DE ELIMINAR */
    const handleDelete = (id) => {

        axios.delete('/playlists/' + id)
            .then(response => {
                alert(response.data.mensaje);
            })
            .catch(error => {
                console.error('Error al enviar los datos:', error);
            });
    };

    /* FUNCIONALIDAD PARA LIMPIAR LAS VARIABLES */
    const handleClear = () => {
        setName('');
        setFile(null);
        setFilename('');
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
                            label="Nombre"
                            variant="outlined"
                            fullWidth
                            sx={{ my: 1 }}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
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
                            <input type="file" accept=".png, .jpg, .jpeg" hidden onChange={handleFileUpload} />
                        </Button>
                        <Box>{filename}</Box>
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
                            <TableCell align="right">Fotografía</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {artistData.map((row) => (
                            <TableRow
                                key={row.id}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">
                                    {row.id}
                                </TableCell>
                                <TableCell align="right">{row.nombre}</TableCell>
                                <TableCell align="right">
                                    <img src={row.url_imagen} alt="Fotografía" style={{ width: '50px', height: '50px' }} />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton color="primary" onClick={() => handleOpen("Actualizar", true, row.id, row.nombre)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="secondary" onClick={() => handleDelete(row.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}

export default Playlist;