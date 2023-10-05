import React, { useState, useRef, useEffect } from 'react';
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

const Song = () => {

    /* Variables a utilizar */
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [filePhoto, setFilePhoto] = useState(null);
    const [audioDuration, setAudioDuration] = useState('');
    const [fileAudio, setFileAudio] = useState(null);
    const [titleModal, setTitleModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);  // Estado para controlar el modo de edicion

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
    };

    /* Para setear el archivo y nombre del audio a subir */
    const [filenameAudio, setFilenameAudio] = useState("");
    const handleFileAudioUpload = (e) => {
        if (!e.target.files) {
            return;
        }

        const fileAudio = e.target.files[0];
        setFileAudio(fileAudio);
        const { name } = fileAudio;
        setFilenameAudio(name);

        const audio = new Audio();
        audio.preload = 'metadata';
        audio.src = URL.createObjectURL(fileAudio);

        audio.onloadedmetadata = () => {
            const durationInSeconds = Math.round(audio.duration);
            setAudioDuration(durationInSeconds);
        };
    };

    /* Para setear el id del artista seleccionado */
    const [idArtist, setIdArtist] = useState('');
    const handleChange = (event) => {
        setIdArtist(event.target.value);
    };

    /* Para setear el audio */
    const audioRef = useRef(null);

    /* Para el funcionamiento del modal que realiza un registro/modificacion */
    const [open, setOpen] = React.useState(false);
    const handleOpen = (titleModal, isEditMode, id_cancion = '', nombre_cancion = '', id_artista = '') => {
        if (isEditMode) {
            setId(id_cancion);
            setName(nombre_cancion);
            setIdArtist(id_artista);
        }
        setTitleModal(titleModal);
        setIsEditMode(isEditMode);  // Actualiza el estado para indicar si estamos en modo de edición
        setOpen(true);
    };
    const handleClose = () => {
        handleClear();
        setOpen(false)
    };

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
    }, []);

    /* FUNCIONALIDAD DE LA TABLA */
    const [tableData, setTableData] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/canciones');
                setTableData(response.data.canciones); // Actualizar el estado con los datos del endpoint
            } catch (error) {
                console.error('Error al obtener los datos:', error);
            }
        };

        fetchData();
    }, [tableData]);

    /** FUNCIONALIDAD DEL BOTON DE GUARDADO */
    const handleSave = () => {
        const formData = new FormData();
        formData.append('nombre', name);
        formData.append('imagen_portada', filePhoto);
        formData.append('duracion', segundosAFormatoTiempo(audioDuration));
        formData.append('archivo_mp3', fileAudio);
        formData.append('id_artista', idArtist);
        if (name === '') {
            alert("El campo nombre es obligatorio");
        } else if (filePhoto === null) {
            alert("El campo fotografía es obligatorio");
        } else if (idArtist === '') {
            alert("El campo artista es obligatorio");
        } else if (fileAudio === null) {
            alert("El campo audio es obligatorio");
        } else {
            axios.post('/canciones', formData)
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

    function segundosAFormatoTiempo(segundos) {
        const horas = Math.floor(segundos / 3600);
        const minutos = Math.floor((segundos % 3600) / 60);
        const segundosRestantes = segundos % 60;
      
        const formatoHora = (valor) => (valor < 10 ? `0${valor}` : `${valor}`);
        
        return `${formatoHora(horas)}:${formatoHora(minutos)}:${formatoHora(segundosRestantes)}`;
      }

    /* FUNCIONALIDAD DEL BOTON DE ACTUALIZAR */
    const handleEdit = () => {
        const formData = new FormData();
        formData.append('nombre', name);
        formData.append('imagen_portada', filePhoto);
        formData.append('duracion', segundosAFormatoTiempo(audioDuration));
        formData.append('archivo_mp3', fileAudio);
        formData.append('id_artista', idArtist);
        formData.append('id_album', null);

        if (name === '') {
            alert("El campo nombre es obligatorio");
        } else if (filePhoto === null) {
            alert("El campo fotografía es obligatorio");
        } else if (idArtist === '') {
            alert("El campo artista es obligatorio");
        } else if (fileAudio === null) {
            alert("El campo audio es obligatorio");
        } else {
            axios.put('/canciones/' + id, formData)
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
        axios.delete('/canciones/' + id)
            .then(response => {
                alert(response.data.mensaje);
            })
            .catch(error => {
                console.error('Error al enviar los datos:', error);
            });
    };

    /* FUNCIONALIDAD PARA LIMPIAR LAS VARIABLES */
    const handleClear = () => {
        setId('');
        setName('');
        setFilePhoto(null);
        setFilenamePhoto('');
        setFileAudio(null);
        setFilenameAudio('');
        setIdArtist('');
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
                            label="Nombre de la canción"
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
                        <Button
                            component="label"
                            variant="outlined"
                            startIcon={<CloudUploadIcon />}
                            sx={{ marginRight: "1rem" }}
                        >
                            Audio MP3
                            <input type="file" accept=".mp3" hidden onChange={handleFileAudioUpload} />
                        </Button>
                        <Box>{filenameAudio}</Box>
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
                            <TableCell align="right">Fotografía</TableCell>
                            <TableCell align="right">Duración</TableCell>
                            <TableCell align="right">Artista</TableCell>
                            <TableCell align="right">Reproducir</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tableData.map((row) => (
                            <TableRow
                                key={row.id_cancion}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">
                                    {row.id_cancion}
                                </TableCell>
                                <TableCell align="right">{row.nombre_cancion}</TableCell>
                                <TableCell align="right">
                                    <img src={row.url_imagen} alt="Fotografía" style={{ width: '50px', height: '50px' }} />
                                </TableCell>
                                <TableCell align="right">{row.duracion}</TableCell>
                                <TableCell align="right">{row.nombre_artista}</TableCell>
                                <TableCell align="right">
                                    <audio ref={audioRef} controls>
                                        <source src={row.url_audio} type="audio/mp3" />
                                        Tu navegador no soporta el elemento de audio.
                                    </audio>
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton color="primary" onClick={() => handleOpen("Actualizar", true, row.id_cancion, row.nombre_cancion, row.id_artista)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="secondary" onClick={() => handleDelete(row.id_cancion)}>
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

export default Song;