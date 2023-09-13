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

/** Actualizar un usuario por su ID */
app.put('/usuarios/:id_usuario/:contrasenia', (req, res) => {

    const id_usuario = req.params.id_usuario;
    const contrasenia = req.params.contrasenia;
    const { nombres, apellidos, foto, correo } = req.body;

    // Se define el query que obtendra la contrasenia encriptada
    const query_contrasenia = 'SELECT contrasenia FROM USUARIO WHERE id = ?';

    // Se ejecuta el query y se realiza la comparacion de contrasenia para realizar la actualizacion del usuario
    db.query(query_contrasenia, [id_usuario], (err, result) => {

        if (err) {
            console.error('Error al verificar usuario:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al verificar el usuario" });
        } else {

            if (result.length <= 0) {
                res.json({ success: false, mensaje: "Credencial incorrecta" });
            } else {
                util.comparePassword(contrasenia, result[0].contrasenia)
                    .then(esCorrecta => {
                        if (esCorrecta) {
                            const query = 'UPDATE USUARIO SET nombres = ?, apellidos = ?, foto = ?, correo = ? WHERE id = ?;';

                            db.query(query, [nombres, apellidos, foto, correo, id_usuario], (err, result) => {
                                if (err) {
                                    console.error('Error al actualizar el usuario:', err);
                                    res.json({ success: false, mensaje: "Ha ocurrido un error al actualizar el usuario" });
                                } else {
                                    res.json({ success: true, mensaje: "Usuario actualizado correctamente" });
                                }
                            });
                        } else {
                            res.json({ success: false, mensaje: "Credencial incorrecta" });
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
app.put('/artistas/:id_artista', (req, res) => {

    const id_artista = req.params.id_artista;
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
app.delete('/artistas/:id_artista', (req, res) => {

    const id_artista = req.params.id_artista;
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
app.put('/albumes/:id_album', (req, res) => {

    const id_album = req.params.id_album;
    const { nombre, descripcion, imagen_portada, id_artista } = req.body;
    const query = 'UPDATE ALBUM SET nombre = ?, descripcion = ?, imagen_portada = ?, id_artista = ? WHERE id = ?';

    db.query(query, [nombre, descripcion, imagen_portada, id_artista, id_album], (err, result) => {
        if (err) {
            console.error('Error al actualizar el álbum:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al actualizar el álbum" });
        } else {
            res.json({ success: true, mensaje: "Álbum actualizado correctamente" });
        }
    });

});

/** Eliminar un álbum por su ID */
app.delete('/albumes/:id_album', (req, res) => {

    const id_album = req.params.id;
    const query = 'DELETE FROM ALBUM WHERE id = ?';

    db.query(query, [id_album], (err, result) => {
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

/** Actualizar una canción por su ID */
app.put('/canciones/:id_cancion', (req, res) => {

    const id_cancion = req.params.id_cancion;
    const { nombre, fotografia, duracion, archivo_mp3, id_artista, id_album } = req.body;
    const query = 'UPDATE CANCION SET nombre = ?, fotografia = ?, duracion = ?, archivo_mp3 = ?, id_artista = ?, id_album = ? WHERE id = ?';

    db.query(query, [nombre, fotografia, duracion, archivo_mp3, id_artista, id_album, id_cancion], (err, result) => {
        if (err) {
            console.error('Error al actualizar la canción:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al actualizar la canción" });
        } else {
            res.json({ success: true, mensaje: "Canción actualizada correctamente" });
        }
    });

});

/** Eliminar una canción por su ID */
app.delete('/canciones/:id_cancion', (req, res) => {

    const id_cancion = req.params.id;
    const query = 'DELETE FROM CANCION WHERE id_cancion = ?';

    db.query(query, [id_cancion], (err, result) => {
        if (err) {
            console.error('Error al eliminar la canción:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al eliminar la canción" });
        } else {
            res.json({ success: true, mensaje: "Canción eliminada correctamente" });
        }
    });
});

/** Obtener todas las canciones que pertenezcan al artista y que no estén agregadas a otro álbum */
app.get('/canciones-artista/:id_artista', (req, res) => {

    const id_artista = req.params.id_artista;
    const query = `SELECT c.id, c.nombre, c.fotografia, c.duracion, a.nombre AS nombre_artista
    FROM CANCION c
    INNER JOIN ARTISTA a ON a.id = c.id_artista
    WHERE c.id_artista = ? AND c.id_album IS NULL`;

    db.query(query, [id_artista], (err, result) => {
        if (err) {
            console.error('Error al obtener las canciones:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al obtener las canciones que contiene el artista" });
        } else {
            res.json({ success: true, canciones_artista: result });
        }
    });

});

/** Obtener todas las canciones que pertenezcan a un album */
app.get('/canciones-album/:id_album', (req, res) => {

    const id_album = req.params.id_album;
    const query = `SELECT c.id, c.nombre, c.fotografia, c.duracion, a.nombre AS nombre_artista
    FROM CANCION c
    INNER JOIN ARTISTA a ON a.id = c.id_artista
    WHERE c.id_album = ?`;

    db.query(query, [id_album], (err, result) => {
        if (err) {
            console.error('Error al obtener las canciones:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al obtener las canciones que contiene el album" });
        } else {
            res.json({ success: true, canciones_album: result });
        }
    });

});

/** Agregar una cancion a un album */
app.put('/canciones-album/:id_cancion', (req, res) => {

    const id_cancion = req.params.id_cancion;
    const { id_album } = req.body;
    const query = 'UPDATE CANCION SET id_album = ? WHERE id = ?';

    db.query(query, [id_album, id_cancion], (err, result) => {
        if (err) {
            console.error('Error al adjuntar la canción en el album:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al adjuntar la canción al album especificado" });
        } else {
            res.json({ success: true, mensaje: "Canción adjuntada correctamente" });
        }
    });

});

/** Eliminar una canción de un album */
app.delete('/canciones-album/:id_cancion', (req, res) => {

    const id_cancion = req.params.id_cancion;
    const query = "UPDATE CANCION SET id_album = null WHERE id = ?";

    db.query(query, [id_cancion], (err, result) => {
        if (err) {
            console.error('Error al eliminar la canción del album:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al eliminar la canción del album" });
        } else {
            res.json({ success: true, mensaje: "Canción eliminada del album correctamente" });
        }
    });
});

/** Agregar una canción a favoritos para un usuario */
app.post('/favoritos', (req, res) => {
    const { id_cancion, id_usuario } = req.body;
    const query = 'INSERT INTO FAVORITO (id_cancion, id_usuario) VALUES (?, ?)';

    db.query(query, [id_cancion, id_usuario], (err, result) => {
        if (err) {
            console.error('Error al agregar la canción a favoritos:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al agregar la canción a favoritos" });
        } else {
            res.json({ success: true, mensaje: "Canción agregada a favoritos correctamente" });
        }
    });
});

/** Obtener todas las canciones favoritas de un usuario */
app.get('/favoritos/:id_usuario', (req, res) => {
    const id_usuario = req.params.id_usuario;
    const query = `SELECT c.id, c.nombre, c.fotografia, c.duracion, a.nombre AS nombre_artista
    FROM FAVORITO f
    INNER JOIN CANCION c ON c.id = f.id_cancion
    INNER JOIN ARTISTA a ON a.id = c.id_artista
    WHERE f.id_usuario = ?`;

    db.query(query, [id_usuario], (err, result) => {
        if (err) {
            console.error('Error al obtener las canciones favoritas:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al obtener las canciones favoritas" });
        } else {
            res.json({ success: true, canciones_favoritas: result });
        }
    });
});

/** Eliminar una canción de un album */
app.delete('/favoritos/:id_favorito', (req, res) => {

    const id_favorito = req.params.id_favorito;
    const query = "DELETE FROM FAVORITO WHERE id = ?";

    db.query(query, [id_favorito], (err, result) => {
        if (err) {
            console.error('Error al eliminar la canción de favoritos:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al eliminar la canción de favoritos" });
        } else {
            res.json({ success: true, mensaje: "Canción eliminada de favoritos correctamente" });
        }
    });
});

/** El usuario puede realizar la búsqueda de álbumes, canciones o artistas por medio de la entrada del usuario. */
app.get('/buscar/:entrada', (req, res) => {

    const entrada = req.params.entrada;

    const query_albumes = `SELECT a.id AS id_album, a.nombre AS nombre_album, a.descripcion, a2.id AS id_artista, a2.nombre AS nombre_artista,
    JSON_ARRAYAGG(JSON_OBJECT('id_cancion', c.id ,'nombre_cancion', c.nombre, 'duracion_cancion', c.duracion)) as detalle_album
    FROM ALBUM a
    INNER JOIN ARTISTA a2 ON a2.id = a.id_artista
    INNER JOIN CANCION c ON c.id_album = a.id
    WHERE CONCAT(a.nombre,a.descripcion) LIKE '%` + entrada + `%'
    GROUP BY a.id`;

    db.query(query_albumes, [], (err, result) => {
        if (err) {
            console.error('Error al obtener las concidencias:', err);
            res.json({ success: false, mensaje: "No se ha encontrado alguna concidencia" });
        } else {

            const albumes = result;

            const query_artista = `SELECT c.id AS id_cancion, c.nombre, c.fotografia, c.duracion, c.archivo_mp3, a.id AS id_artista, a.nombre AS nombre_artista
            FROM CANCION c
            INNER JOIN ARTISTA a ON a.id = c.id_artista
            WHERE a.nombre LIKE '%` + entrada + `%'`;
            db.query(query_artista, [], (err, result) => {
                if (err) {
                    console.error('Error al obtener las concidencias:', err);
                    res.json({ success: false, mensaje: "No se ha encontrado alguna concidencia" });
                } else {

                    const canciones_artista = result;

                    const query_artista = `SELECT c.id AS id_cancion, c.nombre, c.fotografia, c.duracion, c.archivo_mp3, a.id AS id_artista, a.nombre AS nombre_artista
                    FROM CANCION c
                    INNER JOIN ARTISTA a ON a.id = c.id_artista
                    WHERE c.nombre LIKE '%` + entrada + `%'`;
                    db.query(query_artista, [], (err, result) => {
                        if (err) {
                            console.error('Error al obtener las concidencias:', err);
                            res.json({ success: false, mensaje: "No se ha encontrado alguna concidencia" });
                        } else {
                            res.json({ success: true, albumes: albumes, canciones_artista: canciones_artista, canciones: result });
                        }
                    });

                }
            });

        }
    });
});

/** Crear una nueva playlist */
app.post('/playlists', (req, res) => {
    const { nombre, fondo_portada } = req.body;
    const query = 'INSERT INTO PLAYLIST (nombre, fondo_portada) VALUES (?, ?)';

    db.query(query, [nombre, fondo_portada], (err, result) => {
        if (err) {
            console.error('Error al insertar la playlist:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al insertar la playlist" });
        } else {
            res.json({ success: true, mensaje: "Playlist creada correctamente" });
        }
    });
});

/** Actualizar una playlist por su ID */
app.put('/playlists/:id', (req, res) => {
    const playlistId = req.params.id;
    const { nombre, fondo_portada } = req.body;
    const query = 'UPDATE PLAYLIST SET nombre = ?, fondo_portada = ? WHERE id = ?';

    db.query(query, [nombre, fondo_portada, playlistId], (err, result) => {
        if (err) {
            console.error('Error al actualizar la playlist:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al actualizar la playlist" });
        } else {
            res.json({ success: true, mensaje: "Playlist actualizada correctamente" });
        }
    });
});

/** Inicia el servidor y hace que escuche en el puerto especificado */
app.listen(port, host, () => {
    console.log(`La API está escuchando en http://${host}:${port}`);
});
