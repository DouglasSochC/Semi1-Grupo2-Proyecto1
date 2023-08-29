require('dotenv').config();
const express = require('express');
const app = express();
const db = require('./db');
const util = require('./util');
const host = process.env.SV_HOST;
const port = process.env.SV_PORT;

// Middleware para manejar JSON
app.use(express.json());

/** Endpoint inicial */
app.get('/', (req, res) => {
    res.json({ message: '¡Hola!' });
});

/** Creacion de un usuario */
app.post('/usuarios', (req, res) => {

    // Se recibe los parametros que posee esta entidad
    const parametro = req.body;

    // Debido a que la encriptacion devuelve una promesa es necesario realizarlo de la siguiente forma
    util.hashPassword(parametro.contrasenia)
        .then(hashedPassword => {

            // Ordenando los parametros
            const values = [
                parametro.correo,
                hashedPassword,
                parametro.nombres,
                parametro.apellidos,
                parametro.foto,
                parametro.fecha_nacimiento,
                parametro.es_administrador
            ];

            // Se define el query que hara la insercion del usuario
            const query = 'INSERT INTO USUARIO (correo, contrasenia, nombres, apellidos, foto, fecha_nacimiento, es_administrador) VALUES (?)';

            // Se ejecuta el query
            db.query(query, [values], (err, result) => {
                if (err) {
                    console.error('Error al insertar el mensaje:', err);
                    res.json({ success: false, mensaje: "Ha ocurrido un error al insertar el usuario" });
                } else {
                    res.json({ success: true, mensaje: "Usuario creado correctamente", id_insertado: result.insertId });
                }
            });

        })
        .catch(error => {
            console.error("Error al encriptar contraseña:", error);
            res.json({ success: false, mensaje: "Ha ocurrido un error al encriptar la contraseña" });
        });

});

/** Obtener un solo usuario */
app.get('/usuarios/:correo/:contrasenia', (req, res) => {

    // Se recibe los parametros
    const correo = req.params.correo;
    const contrasenia = req.params.contrasenia;

    // Se define el query que obtendra la contrasenia encriptada
    const query = 'SELECT id, contrasenia FROM USUARIO WHERE correo = ?';

    // Se ejecuta el query y se realiza la comparacion de contrasenia para verificar que el inicio de sesion sea correcto
    db.query(query, [correo], (err, result) => {

        if (err) {
            console.error('Error al obtener usuario:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al obtener el usuario" });
        } else {

            if (result.length <= 0) {
                res.json({ success: false, mensaje: "Credenciales incorrectas" });
            } else {
                util.comparePassword(contrasenia, result[0].contrasenia)
                    .then(esCorrecta => {
                        if (esCorrecta) {
                            res.json({ success: true, mensaje: "Bienvenido", extra: result[0].id });
                        } else {
                            res.json({ success: false, mensaje: "Credenciales incorrectas" });
                        }
                    })
                    .catch(error => {
                        console.error('Error al comparar contraseñas:', error);
                        res.json({ success: false, mensaje: "Ha ocurrido un error al desencriptar la contraseña" });
                    });
            }

        }

    });

});

/** Crear un nuevo artista */
app.post('/artistas', (req, res) => {
    const { nombre, fotografia, fecha_nacimiento } = req.body;
    const query = 'INSERT INTO ARTISTA (nombre, fotografia, fecha_nacimiento) VALUES (?, ?, ?)';

    db.query(query, [nombre, fotografia, fecha_nacimiento], (err, result) => {
        if (err) {
            console.error('Error al insertar el artista:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al insertar el artista" });
        } else {
            res.json({ success: true, mensaje: "Artista creado correctamente" });
        }
    });
});

/** Obtener todos los artistas */
app.get('/artistas', (req, res) => {
    const query = 'SELECT * FROM ARTISTA';

    db.query(query, (err, result) => {
        if (err) {
            console.error('Error al obtener los artistas:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al obtener los artistas" });
        } else {
            res.json({ success: true, artistas: result });
        }
    });
});

/** Actualizar un artista por su ID */
app.put('/artistas/:id', (req, res) => {

    const id_artista = req.params.id;
    const { nombre, fotografia, fecha_nacimiento } = req.body;
    const query = 'UPDATE ARTISTA SET nombre = ?, fotografia = ?, fecha_nacimiento = ? WHERE id = ?';

    db.query(query, [nombre, fotografia, fecha_nacimiento, id_artista], (err, result) => {
        if (err) {
            console.error('Error al actualizar el artista:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al actualizar el artista" });
        } else {
            res.json({ success: true, mensaje: "Artista actualizado correctamente" });
        }
    });

});

/** Eliminar un artista por su ID */
app.delete('/artistas/:id', (req, res) => {

    const id_artista = req.params.id;
    const query = 'DELETE FROM ARTISTA WHERE id = ?';

    db.query(query, [id_artista], (err, result) => {
        if (err) {
            console.error('Error al eliminar el artista:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al eliminar el artista" });
        } else {
            res.json({ success: true, mensaje: "Artista eliminado correctamente" });
        }
    });

});

/** Crear un nuevo álbum */
app.post('/albumes', (req, res) => {
    const { nombre, descripcion, imagen_portada, id_artista } = req.body;
    const query = 'INSERT INTO ALBUM (nombre, descripcion, imagen_portada, id_artista) VALUES (?, ?, ?, ?)';

    db.query(query, [nombre, descripcion, imagen_portada, id_artista], (err, result) => {
        if (err) {
            console.error('Error al insertar el álbum:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al insertar el álbum" });
        } else {
            res.json({ success: true, mensaje: "Álbum creado correctamente" });
        }
    });
});

/** Actualizar un álbum por su ID */
app.put('/albumes/:id', (req, res) => {
    const albumId = req.params.id;
    const { nombre, descripcion, imagen_portada, id_artista } = req.body;
    const query = 'UPDATE ALBUM SET nombre = ?, descripcion = ?, imagen_portada = ?, id_artista = ? WHERE id = ?';

    db.query(query, [nombre, descripcion, imagen_portada, id_artista, albumId], (err, result) => {
        if (err) {
            console.error('Error al actualizar el álbum:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al actualizar el álbum" });
        } else {
            res.json({ success: true, mensaje: "Álbum actualizado correctamente" });
        }
    });
});

/** Eliminar un álbum por su ID */
app.delete('/albumes/:id', (req, res) => {
    const albumId = req.params.id;
    const query = 'DELETE FROM ALBUM WHERE id = ?';

    db.query(query, [albumId], (err, result) => {
        if (err) {
            console.error('Error al eliminar el álbum:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al eliminar el álbum" });
        } else {
            res.json({ success: true, mensaje: "Álbum eliminado correctamente" });
        }
    });
});

/** Crear una nueva canción */
app.post('/canciones', (req, res) => {
    const { nombre, fotografia, duracion, archivo_mp3, id_artista, id_album } = req.body;
    const query = 'INSERT INTO CANCION (nombre, fotografia, duracion, archivo_mp3, id_artista, id_album) VALUES (?, ?, ?, ?, ?, ?)';

    db.query(query, [nombre, fotografia, duracion, archivo_mp3, id_artista, id_album], (err, result) => {
        if (err) {
            console.error('Error al insertar la canción:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al insertar la canción" });
        } else {
            res.json({ success: true, mensaje: "Canción creada correctamente" });
        }
    });
});

/** Obtener todas las canciones */
app.get('/canciones', (req, res) => {

    const query = 'SELECT * FROM CANCION';

    db.query(query, (err, result) => {
        if (err) {
            console.error('Error al obtener las canciones:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al obtener las canciones" });
        } else {
            res.json({ success: true, canciones: result });
        }
    });
});

/** Inicia el servidor y hace que escuche en el puerto especificado */
app.listen(port, host, () => {
    console.log(`La API está escuchando en http://${host}:${port}`);
});
