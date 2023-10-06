require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./db');
const util = require('./util');
const path = require('path');
const host = process.env.SV_HOST;
const port = process.env.SV_PORT;

// Configuracion
app.use(express.urlencoded({ limit: '10mb', extended: true })); // Middleware
app.use(express.json({ limit: '10mb' })); // Middleware para manejar JSON y tamanio maximo del JSON
app.use(cors({ origin: '*' })); // CORS

// Dependencias para AWS
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');

// Configura las credenciales y la región de AWS
let s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    sslEnabled: false,
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
});

// Configuración de multer para manejar archivos multipart
const upload = multer();

const uploadFiletoS3 = (file, folder_name, callback) => {

    const key = `${folder_name}/${Date.now().toString()}${path.extname(file.originalname)}`;

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    const putCommand = new PutObjectCommand(params);

    s3.send(putCommand, (err, data) => {
        if (err) {
            callback(err);
        } else {
            callback(null, key);
        }
    });
};

const deleteFiletoS3 = (key, callback) => {

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
    };

    const deleteCommand = new DeleteObjectCommand(params);

    s3.send(deleteCommand, (err, data) => {
        if (err) {
            callback(err);
        } else {
            callback(null, data);
        }
    });
};

/** Endpoint inicial */
app.get('/', (req, res) => {
    res.json({ message: '¡Hola!' });
});

/** Creacion de un usuario */
app.post('/usuarios/register', upload.single('archivo'), (req, res) => {

    // Se recibe los parametros que posee esta entidad
    const parametro = req.body;

    // Debido a que la encriptacion devuelve una promesa es necesario realizarlo de la siguiente forma
    util.hashPassword(parametro.contrasenia)

        .then(hashedPassword => {

            const hashed = hashedPassword;

            uploadFiletoS3(req.file, process.env.AWS_BUCKET_FOLDER_FOTOS, (err, data) => {
                if (err) {
                    console.error('Error al subir el archivo de S3:', err);
                    res.json({ success: false, mensaje: "Ha ocurrido un error al subir el archivo" });
                } else {
                    const url_archivo = data;
                    parametro.es_administrador = (String(parametro.es_administrador).toLowerCase() === 'true');
                    const query = 'INSERT INTO USUARIO (correo, contrasenia, nombres, apellidos, foto, fecha_nacimiento, es_administrador) VALUES (?, ?, ?, ?, ?, ?, ?)';
                    db.query(query, [parametro.correo, hashed, parametro.nombres, parametro.apellidos, url_archivo, parametro.fecha_nacimiento, parametro.es_administrador], (err, result) => {
                        if (err) {
                            console.error('Error al insertar el mensaje:', err);
                            res.json({ success: false, mensaje: "Ha ocurrido un error al insertar el usuario" });
                        } else {
                            res.json({ success: true, mensaje: "Usuario creado correctamente", id_insertado: result.insertId });
                        }
                    });
                }
            });

        })
        .catch(error => {
            console.error("Error al encriptar contraseña:", error);
            res.json({ success: false, mensaje: "Ha ocurrido un error al encriptar la contraseña" });
        });

});

/** Verificacion del usuario */
app.post('/usuarios/login', (req, res) => {
    // Se recibe los parametros
    const correo = req.body.correo;
    const contrasenia = req.body.contrasenia;

    // Se define el query que obtendra la contrasenia encriptada
    const query = 'SELECT id, contrasenia, es_administrador FROM USUARIO WHERE correo = ?';

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
                            res.json({ success: true, mensaje: "Bienvenido", extra: { id_usuario: result[0].id, es_administrador: result[0].es_administrador } });
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

/* Optiene usuario por su ID */
app.get('/usuario/:id', (req, res) => {
    const id = req.params.id;
    const query = `SELECT nombres, apellidos, foto, correo, fecha_nacimiento, es_administrador FROM USUARIO WHERE id = ?`;
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al obtener el usuario:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al obtener el usuario" });
        } else {
            res.json({ success: true, usuario: result[0] });
        }
    });
});

/** Actualizar un usuario por su ID */
app.put('/usuarios/:id_usuario/:contrasenia', upload.single('archivo'), (req, res) => {

    // Se obtienen los parametros a utilizar para actualizar los datos de un usuario
    const id_usuario = req.params.id_usuario;
    const contrasenia = req.params.contrasenia;
    const { nombres, apellidos, correo } = req.body;
    var nueva_contrasenia = req.body.nueva_contrasenia;
    if (nueva_contrasenia == '') {
        nueva_contrasenia = contrasenia;
    }
    util.hashPassword(nueva_contrasenia)
        .then(hashedPassword => {
            nueva_contrasenia = hashedPassword
            const query_select = 'SELECT foto, contrasenia FROM USUARIO WHERE id = ?';
            db.query(query_select, [id_usuario], (err, result) => {
                if (err) {
                    console.error('Error al obtener al usuario:', err);
                    res.json({ success: false, mensaje: "Ha ocurrido un error al obtener al usuario" });
                } else {
                    util.comparePassword(contrasenia, result[0].contrasenia)
                        .then(esCorrecta => {
                            if (esCorrecta) {
                                if (req.file == undefined || req.file == null) {
                                    const query = 'UPDATE USUARIO SET nombres = ?, apellidos = ?, correo = ?, contrasenia = ? WHERE id = ?;';
                                    db.query(query, [nombres, apellidos, correo, nueva_contrasenia, id_usuario], (err, result) => {
                                        if (err) {
                                            console.error('Error al actualizar el usuario:', err);
                                            res.json({ success: false, mensaje: "Ha ocurrido un error al actualizar el usuario" });
                                        } else {
                                            res.json({ success: true, mensaje: "Usuario actualizado correctamente" });
                                        }
                                    });
                                } else {
                                    deleteFiletoS3(result[0].foto, (err, data) => {
                                        if (err) {
                                            console.error('Error al eliminar la imagen de S3:', err);
                                            res.json({ success: false, mensaje: "Ha ocurrido un error al eliminar la imagen" });
                                        } else {
                                            uploadFiletoS3(req.file, process.env.AWS_BUCKET_FOLDER_FOTOS, (err, data) => {
                                                if (err) {
                                                    console.error('Error al subir el archivo de S3:', err);
                                                    res.json({ success: false, mensaje: "Ha ocurrido un error al subir el archivo" });
                                                } else {
                                                    const url_imagen = data;
                                                    const query = 'UPDATE USUARIO SET nombres = ?, apellidos = ?, foto = ?, correo = ?, contrasenia = ? WHERE id = ?;';
                                                    db.query(query, [nombres, apellidos, url_imagen, correo, nueva_contrasenia, id_usuario], (err, result) => {
                                                        if (err) {
                                                            console.error('Error al actualizar el usuario:', err);
                                                            res.json({ success: false, mensaje: "Ha ocurrido un error al actualizar el usuario" });
                                                        } else {
                                                            res.json({ success: true, mensaje: "Usuario actualizado correctamente" });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            } else {
                                res.json({ success: false, mensaje: "Contraseña incorrecta" });
                            }
                        })
                        .catch(error => {
                            console.error('Error al comparar contraseñas:', error);
                            res.json({ success: false, mensaje: "Ha ocurrido un error al desencriptar la contraseña" });
                        });
                }
            });
        })
        .catch(error => {
            console.error("Error al encriptar contraseña:", error);
            res.json({ success: false, mensaje: "Ha ocurrido un error al encriptar la contraseña" });
        });
});

/** Verificacion de un usuario administrador por medio de su contrasenia para que asi se pueda realizar alguna transaccion segun sea el caso */
app.post('/usuarios/password', (req, res) => {

    // Se recibe el parametro contrasenia
    const contrasenia = req.body.contrasenia;
    const query = `SELECT id, contrasenia FROM USUARIO WHERE es_administrador = TRUE`;
    db.query(query, async (err, result) => {
        if (err) {
            console.error('Error al validar la contraseña:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al validar la contraseña" });
        } else {

            const comparacionesPromises = result.map(element => {
                return util.comparePassword(contrasenia, element.contrasenia)
                    .catch(error => {
                        console.error('Error al comparar contraseñas:', error);
                        throw new Error('Ha ocurrido un error al desencriptar la contraseña');
                    });
            });

            try {
                const comparaciones = await Promise.all(comparacionesPromises);
                const es_valido = comparaciones.some(esCorrecta => esCorrecta);

                if (es_valido) {
                    res.json({ success: true, mensaje: "La contraseña es valida para realizar la transacción" });
                } else {
                    res.json({ success: false, mensaje: "La contraseña no es valida para realizar la transacción" });
                }
            } catch (error) {
                console.error('Error:', error);
                res.json({ success: false, mensaje: "Ha ocurrido un error: " + error.message });
            }
        }
    });
});

/** Crear un nuevo artista */
app.post('/artistas', upload.single('archivo'), (req, res) => {

    let { nombre, fecha_nacimiento } = req.body;
    uploadFiletoS3(req.file, process.env.AWS_BUCKET_FOLDER_FOTOS, (err, data) => {
        if (err) {
            console.error('Error al subir el archivo de S3:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al subir el archivo" });
        } else {
            const url_archivo = data;
            fecha_nacimiento = fecha_nacimiento == '' || fecha_nacimiento == 'null' ? null : fecha_nacimiento;
            const query_insert = 'INSERT INTO ARTISTA (nombre, fotografia, fecha_nacimiento) VALUES (?, ?, ?)';
            db.query(query_insert, [nombre, url_archivo, fecha_nacimiento], (err, result) => {
                if (err) {
                    console.error('Error al insertar el artista:', err);
                    res.json({ success: false, mensaje: "Ha ocurrido un error al insertar el artista" });
                } else {
                    res.json({ success: true, mensaje: "Artista creado correctamente" });
                }
            });
        }
    });

});

/** Obtener todos los artistas */
app.get('/artistas', (req, res) => {
    const query = `SELECT a.id, a.nombre,
    CONCAT('https://` + process.env.AWS_BUCKET_NAME + `.s3.amazonaws.com/',fotografia) AS url_imagen,
    DATE_FORMAT(a.fecha_nacimiento, '%d/%m/%Y') AS fecha_nacimiento,
    DATE_FORMAT(a.fecha_nacimiento, '%Y-%m-%d') AS fecha_formateada
    FROM ARTISTA a`;

    db.query(query, (err, result) => {
        if (err) {
            console.error('Error al obtener los artistas:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al obtener los artistas" });
        } else {
            res.json({ success: true, artistas: result });
        }
    });
});

/* Obtener Artista por su ID */
app.get('/artista/:id', (req, res) => {
    const id = req.params.id;
    const query = `SELECT a.id AS Artista_ID, a.nombre AS Artista_Nombre,
    CONCAT('https://` + process.env.AWS_BUCKET_NAME + `.s3.amazonaws.com/',fotografia) AS url_imagen,
    DATE_FORMAT(a.fecha_nacimiento, '%d/%m/%Y') AS fecha_nacimiento
    FROM ARTISTA a
    WHERE a.id = ?;`;

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al obtener al artista:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al obtener al artista" });
        } else {
            res.json({ success: true, artista: result[0] });
        }
    });
});

/** Actualizar un artista por su ID */
app.put('/artistas/:id_artista', upload.single('archivo'), (req, res) => {

    const id_artista = req.params.id_artista;
    let { nombre, fecha_nacimiento } = req.body;
    const query_select_fotografia = 'SELECT fotografia FROM ARTISTA WHERE id = ?';

    db.query(query_select_fotografia, [id_artista], (err, result) => {
        if (err) {
            console.error('Error al obtener la URL del archivo a modificar:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al obtener la URL del archivo a modificar" });
        } else {
            deleteFiletoS3(result[0].fotografia, (err, data) => {
                if (err) {
                    console.error('Error al eliminar la imagen de S3:', err);
                    res.json({ success: false, mensaje: "Ha ocurrido un error al eliminar la imagen" });
                } else {
                    uploadFiletoS3(req.file, process.env.AWS_BUCKET_FOLDER_FOTOS, (err, data) => {
                        if (err) {
                            console.error('Error al subir el archivo de S3:', err);
                            res.json({ success: false, mensaje: "Ha ocurrido un error al subir el archivo" });
                        } else {
                            const url_imagen = data;
                            fecha_nacimiento = fecha_nacimiento == '' || fecha_nacimiento == 'null' ? null : fecha_nacimiento;
                            const query = 'UPDATE ARTISTA SET nombre = ?, fotografia = ?, fecha_nacimiento = ? WHERE id = ?';
                            db.query(query, [nombre, url_imagen, fecha_nacimiento, id_artista], (err, result) => {
                                if (err) {
                                    console.error('Error al actualizar el artista:', err);
                                    res.json({ success: false, mensaje: "Ha ocurrido un error al actualizar el artista" });
                                } else {
                                    res.json({ success: true, mensaje: "Artista actualizado correctamente" });
                                }
                            });
                        }
                    });
                }
            });
        }
    });

});

/** Eliminar un artista por su ID */
app.delete('/artistas/:id_artista', (req, res) => {

    const id_artista = req.params.id_artista;
    const query_select_fotografia = 'SELECT fotografia FROM ARTISTA WHERE id = ?';

    db.query(query_select_fotografia, [id_artista], (err, result) => {
        if (err) {
            console.error('Error al obtener la URL de la imagen:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al obtener la URL de la imagen" });
        } else {
            if (result.length <= 0) {
                res.json({ success: true, mensaje: "Artista eliminado correctamente" });
            } else {
                const key = result[0].fotografia;
                deleteFiletoS3(key, (err, data) => {
                    if (err) {
                        console.error('Error al eliminar la imagen de S3:', err);
                        res.json({ success: false, mensaje: "Ha ocurrido un error al eliminar la imagen" });
                    } else {
                        const deleteQuery = 'DELETE FROM ARTISTA WHERE id = ?';
                        db.query(deleteQuery, [id_artista], (err, result) => {
                            if (err) {
                                console.error('Error al eliminar el artista:', err);
                                res.json({ success: false, mensaje: "Ha ocurrido un error al eliminar el artista" });
                            } else {
                                res.json({ success: true, mensaje: "Artista eliminado correctamente" });
                            }
                        });
                    }
                });
            }
        }
    });
});

/** Optener todos los albumes */
app.get('/albumes', (req, res) => {

    const query = `SELECT c.id AS id_album, c.nombre AS nombre_album, c.descripcion, a.id AS id_artista, a.nombre AS nombre_artista,
    CONCAT('https://` + process.env.AWS_BUCKET_NAME + `.s3.amazonaws.com/', c.imagen_portada) AS url_imagen
    FROM ALBUM c
    INNER JOIN ARTISTA a ON a.id = c.id_artista`;

    db.query(query, (err, result) => {
        if (err) {
            console.error('Error al obtener las canciones:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al obtener las canciones" });
        } else {
            res.json({ success: true, albumes: result });
        }
    });

});

/* Obtener Album por su ID */
app.get('/album/:id', (req, res) => {
    const id = req.params.id;
    const query = `SELECT
        ALB.id AS 'Album_ID',
        ALB.nombre AS 'Album_Nombre',
        ALB.descripcion AS 'Album_Descripcion',
        CONCAT('https://` + process.env.AWS_BUCKET_NAME + `.s3.amazonaws.com/', ALB.imagen_portada) AS 'Album_ImagenPortada',
        ALB.id_artista AS 'Artista_ID',
        ART.nombre AS 'Artista_Nombre'
    FROM ALBUM ALB
    JOIN ARTISTA ART ON ALB.id_artista = ART.id
    WHERE ALB.id = ?;`;

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al obtener el album:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al obtener el album" });
        } else {
            res.json({ success: true, album: result[0] });
        }
    });
});

/* Obtener Albumes de un artista */
app.get('/albumes-artista/:id', (req, res) => {
    const id = req.params.id;
    const query = `SELECT
        ALB.id AS 'Album_ID',
        ALB.nombre AS 'Album_Nombre',
        ALB.descripcion AS 'Album_Descripcion',
        ALB.imagen_portada AS 'Album_ImagenPortada',
        ALB.id_artista AS 'Artista_ID'
    FROM ALBUM ALB
    WHERE ALB.id_artista = ?`;

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al obtener llos albumes:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al obtener los albumes" });
        } else {
            res.json({ success: true, albumes_artista: result });
        }
    });

});

/** Crear un nuevo album */
app.post('/albumes', upload.single('archivo'), (req, res) => {
    const { nombre, descripcion, id_artista } = req.body;
    uploadFiletoS3(req.file, process.env.AWS_BUCKET_FOLDER_FOTOS, (err, data) => {
        if (err) {
            console.error('Error al subir el archivo a S3:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al subir el archivo" });
        } else {
            const url_imagen = data;
            const query = 'INSERT INTO ALBUM (nombre, descripcion, imagen_portada, id_artista) VALUES (?, ?, ?, ?)';

            db.query(query, [nombre, descripcion, url_imagen, id_artista], (err, result) => {
                if (err) {
                    console.error('Error al insertar el álbum:', err);
                    res.json({ success: false, mensaje: "Ha ocurrido un error al insertar el álbum" });
                } else {
                    res.json({ success: true, mensaje: "Álbum creado correctamente" });
                }
            });
        }
    });
});

/** Actualizar un album por su ID */
app.put('/albumes/:id_album', upload.single('archivo'), (req, res) => {
    const id_album = req.params.id_album;
    const { nombre, descripcion, id_artista } = req.body;
    const query_select_imagen = 'SELECT imagen_portada FROM ALBUM WHERE id = ?';

    db.query(query_select_imagen, [id_album], (err, result) => {
        if (err) {
            console.error('Error al obtener la URL del archivo a modificar:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al obtener la URL del archivo a modificar" });
        } else {
            deleteFiletoS3(result[0].imagen_portada, (err, data) => {
                if (err) {
                    console.error('Error al eliminar la imagen de S3:', err);
                    res.json({ success: false, mensaje: "Ha ocurrido un error al eliminar la imagen" });
                } else {
                    uploadFiletoS3(req.file, process.env.AWS_BUCKET_FOLDER_FOTOS, (err, data) => {
                        if (err) {
                            console.error('Error al subir el archivo a S3:', err);
                            res.json({ success: false, mensaje: "Ha ocurrido un error al subir el archivo" });
                        } else {
                            const url_imagen = data;
                            const query = 'UPDATE ALBUM SET nombre = ?, descripcion = ?, imagen_portada = ?, id_artista = ? WHERE id = ?';
                            db.query(query, [nombre, descripcion, url_imagen, id_artista, id_album], (err, result) => {
                                if (err) {
                                    console.error('Error al actualizar el álbum:', err);
                                    res.json({ success: false, mensaje: "Ha ocurrido un error al actualizar el álbum" });
                                } else {
                                    res.json({ success: true, mensaje: "Álbum actualizado correctamente" });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

/** Eliminar un album por su ID */
app.delete('/albumes/:id_album', (req, res) => {
    const id_album = req.params.id_album;
    const query_select_imagen = 'SELECT imagen_portada FROM ALBUM WHERE id = ?';

    db.query(query_select_imagen, [id_album], (err, result) => {
        if (err) {
            console.error('Error al obtener la URL del archivo:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al obtener la URL del archivo" });
        } else {
            const url_imagen = result[0].imagen_portada;

            deleteFiletoS3(url_imagen, (err, data) => {
                if (err) {
                    console.error('Error al eliminar el archivo de S3:', err);
                    res.json({ success: false, mensaje: "Ha ocurrido un error al eliminar el archivo" });
                } else {
                    const query = 'DELETE FROM ALBUM WHERE id = ?';

                    db.query(query, [id_album], (err, result) => {
                        if (err) {
                            console.error('Error al eliminar el álbum:', err);
                            res.json({ success: false, mensaje: "Ha ocurrido un error al eliminar el álbum" });
                        } else {
                            res.json({ success: true, mensaje: "Álbum eliminado correctamente" });
                        }
                    });
                }
            });
        }
    });
});

/** Crear una nueva cancion */
app.post('/canciones', upload.fields([{ name: 'imagen_portada', maxCount: 1 }, { name: 'archivo_mp3', maxCount: 1 }]), (req, res) => {
    const { nombre, duracion, id_artista, id_album } = req.body;

    uploadFiletoS3(req.files.imagen_portada[0], process.env.AWS_BUCKET_FOLDER_FOTOS, (err, data) => {
        if (err) {
            console.error('Error al subir la imagen a S3:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al subir la imagen" });
        } else {

            const url_imagen = data;
            uploadFiletoS3(req.files.archivo_mp3[0], process.env.AWS_BUCKET_FOLDER_CANCIONES, (err, data) => {
                if (err) {
                    console.error('Error al subir el audio a S3:', err);
                    res.json({ success: false, mensaje: "Ha ocurrido un error al subir el audio" });
                } else {
                    const url_audio = data;
                    const query = 'INSERT INTO CANCION (nombre, fotografia, duracion, archivo_mp3, id_artista, id_album) VALUES (?, ?, ?, ?, ?, ?)';
                    db.query(query, [nombre, url_imagen, duracion, url_audio, id_artista, id_album], (err, result) => {
                        if (err) {
                            console.error('Error al insertar la canción:', err);
                            res.json({ success: false, mensaje: "Ha ocurrido un error al insertar la canción" });
                        } else {
                            res.json({ success: true, mensaje: "Canción creada correctamente" });
                        }
                    });
                }
            });

        }
    });
});

/** Obtener todas las canciones */
app.get('/canciones', (req, res) => {

    const query = `SELECT c.id AS id_cancion, c.nombre AS nombre_cancion, c.duracion, a.id AS id_artista, a.nombre AS nombre_artista,
    CONCAT('https://` + process.env.AWS_BUCKET_NAME + `.s3.amazonaws.com/', c.fotografia) AS url_imagen,
    CONCAT('https://` + process.env.AWS_BUCKET_NAME + `.s3.amazonaws.com/', c.archivo_mp3) AS url_audio
    FROM CANCION c
    INNER JOIN ARTISTA a ON a.id = c.id_artista`;

    db.query(query, (err, result) => {
        if (err) {
            console.error('Error al obtener las canciones:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al obtener las canciones" });
        } else {
            res.json({ success: true, canciones: result });
        }
    });

});

/* Obtener cancion por su ID */
app.get('/cancion/:id', (req, res) => {
    const id = req.params.id;
    const query = `SELECT
        CAN.id AS 'Cancion_ID',
        CAN.nombre AS 'Cancion_Nombre',
        CONCAT('https://` + process.env.AWS_BUCKET_NAME + `.s3.amazonaws.com/', CAN.fotografia) AS 'Cancion_Fotografia',
        CONCAT('https://` + process.env.AWS_BUCKET_NAME + `.s3.amazonaws.com/', CAN.archivo_mp3) AS 'Cancion_Archivo_MP3',
        CAN.duracion AS 'Cancion_Duracion',
        ART.id AS 'Artista_ID',
        ART.nombre AS 'Artista_Nombre',
        ALB.id AS 'Album_ID',
        ALB.nombre AS 'Album_Nombre'
    FROM CANCION CAN
    JOIN ARTISTA ART ON CAN.id_artista = ART.id
    LEFT JOIN ALBUM ALB ON CAN.id_album = ALB.id
    WHERE CAN.id = ?;`;

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al obtener la cancion:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al obtener la cancion" });
        } else {
            res.json({ success: true, cancion: result[0] });
        }
    });

});

/** Actualizar una cancion por su ID */
app.put('/canciones/:id_cancion', upload.fields([{ name: 'imagen_portada', maxCount: 1 }, { name: 'archivo_mp3', maxCount: 1 }]), (req, res) => {

    const id_cancion = req.params.id_cancion;
    const { nombre, duracion, id_artista, id_album } = req.body;

    const query_select = 'SELECT fotografia, archivo_mp3 FROM CANCION WHERE id = ?';

    db.query(query_select, [id_cancion], (err, result) => {
        if (err) {
            console.error('Error al obtener la URL de los archivos a modificar:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al obtener la URL de los archivos a modificar" });
        } else {

            deleteFiletoS3(result[0].fotografia, (err, data) => {
                if (err) {
                    console.error('Error al eliminar la imagen anterior de S3:', err);
                    res.json({ success: false, mensaje: "Ha ocurrido un error al eliminar la imagen anterior" });
                } else {
                    deleteFiletoS3(result[0].archivo_mp3, (err, data) => {
                        if (err) {
                            console.error('Error al eliminar el archivo MP3 anterior de S3:', err);
                            res.json({ success: false, mensaje: "Ha ocurrido un error al eliminar el archivo MP3 anterior" });
                        } else {
                            uploadFiletoS3(req.files.imagen_portada[0], process.env.AWS_BUCKET_FOLDER_FOTOS, (err, data) => {
                                if (err) {
                                    console.error('Error al subir el nuevo archivo de imagen a S3:', err);
                                    res.json({ success: false, mensaje: "Ha ocurrido un error al subir el nuevo archivo de imagen" });
                                } else {
                                    const url_fotografia = data;
                                    uploadFiletoS3(req.files.archivo_mp3[0], process.env.AWS_BUCKET_FOLDER_CANCIONES, (err, data) => {
                                        if (err) {
                                            console.error('Error al subir el nuevo archivo de imagen a S3:', err);
                                            res.json({ success: false, mensaje: "Ha ocurrido un error al subir el nuevo archivo de imagen" });
                                        } else {
                                            const url_archivo_mp3 = data;
                                            const query = 'UPDATE CANCION SET nombre = ?, fotografia = ?, duracion = ?, archivo_mp3 = ?, id_artista = ?, id_album = ' + id_album + ' WHERE id = ?';
                                            db.query(query, [nombre, url_fotografia, duracion, url_archivo_mp3, id_artista, id_cancion], (err, result) => {
                                                if (err) {
                                                    console.error('Error al actualizar la canción:', err);
                                                    res.json({ success: false, mensaje: "Ha ocurrido un error al actualizar la canción" });
                                                } else {
                                                    res.json({ success: true, mensaje: "Canción actualizada correctamente" });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });

        }
    });
});

/** Eliminar una cancion por su ID */
app.delete('/canciones/:id_cancion', (req, res) => {

    const id_cancion = req.params.id_cancion;
    const query_select = 'SELECT fotografia, archivo_mp3 FROM CANCION WHERE id = ?';

    db.query(query_select, [id_cancion], (err, result) => {
        if (err) {
            console.error('Error al obtener la URL los archivos a eliminar:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al obtener la URL los archivos a eliminar" });
        } else {

            deleteFiletoS3(result[0].archivo_mp3, (err, data) => {
                if (err) {
                    console.error('Error al eliminar el archivo MP3 de S3:', err);
                    res.json({ success: false, mensaje: "Ha ocurrido un error al eliminar el archivo MP3" });
                } else {
                    deleteFiletoS3(result[0].fotografia, (err, data) => {
                        if (err) {
                            console.error('Error al eliminar la imagen de S3:', err);
                            res.json({ success: false, mensaje: "Ha ocurrido un error al eliminar la imagen" });
                        } else {
                            const query = 'DELETE FROM CANCION WHERE id = ?';
                            db.query(query, [id_cancion], (err, result) => {
                                if (err) {
                                    console.error('Error al eliminar la canción:', err);
                                    res.json({ success: false, mensaje: "Ha ocurrido un error al eliminar la canción" });
                                } else {
                                    res.json({ success: true, mensaje: "Canción eliminada correctamente" });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

/** Obtener todas las canciones que pertenezcan al artista y que no estén agregadas a otro album */
app.get('/canciones-artista/:id_album', (req, res) => {

    const id_album = req.params.id_album;
    const query = `SELECT c.id AS id_cancion, c.nombre AS nombre_cancion, CONCAT('https://` + process.env.AWS_BUCKET_NAME + `.s3.amazonaws.com/', c.fotografia) AS url_imagen_cancion, c.duracion AS duracion_cancion, a.nombre AS nombre_artista
    FROM CANCION c
    INNER JOIN ARTISTA a ON a.id = c.id_artista
    WHERE c.id_artista = (SELECT id_artista FROM ALBUM WHERE id = ?) AND c.id_album IS NULL`;

    db.query(query, [id_album], (err, result) => {
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
    const query = `SELECT c.id AS id_cancion, c.nombre AS nombre_cancion, CONCAT('https://` + process.env.AWS_BUCKET_NAME + `.s3.amazonaws.com/', c.fotografia) AS url_imagen_cancion, c.duracion AS duracion_cancion, a.nombre AS nombre_artista
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

/** Eliminar una cancion de un album */
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

/** Obtener todas las canciones que pertenezcan a una playlist */
app.get('/canciones-playlist/:id_playlist', (req, res) => {

    const id_playlist = req.params.id_playlist;
    const query = `SELECT p.id AS id_playlist, c.id AS id_cancion, c.nombre AS nombre_cancion, CONCAT('https://` + process.env.AWS_BUCKET_NAME + `.s3.amazonaws.com/', c.fotografia) AS url_imagen_cancion, c.duracion AS duracion_cancion, a.nombre AS nombre_artista
    FROM PLAYLIST p
    INNER JOIN DETALLE_PLAYLIST dp ON dp.id_playlist = p.id
    INNER JOIN CANCION c ON c.id = dp.id_cancion
    INNER JOIN ARTISTA a ON a.id = c.id_artista
    WHERE p.id = ?`;

    db.query(query, [id_playlist], (err, result) => {
        if (err) {
            console.error('Error al obtener las canciones:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al obtener las canciones que contiene la playlist" });
        } else {
            res.json({ success: true, canciones_playlist: result });
        }
    });

});

/** Obtener todas las canciones que NO pertenezcan a una playlist */
app.get('/canciones-no-playlist/:id_playlist', (req, res) => {

    const id_playlist = req.params.id_playlist;
    const query = `SELECT c.id AS id_cancion, c.nombre AS nombre_cancion, CONCAT('https://` + process.env.AWS_BUCKET_NAME + `.s3.amazonaws.com/', c.fotografia) AS url_imagen_cancion, c.duracion AS duracion_cancion, a.nombre AS nombre_artista
    FROM CANCION c
    INNER JOIN ARTISTA a ON a.id = c.id_artista
    WHERE c.id NOT IN (SELECT id_cancion FROM DETALLE_PLAYLIST dp WHERE dp.id_playlist = ?)`;

    db.query(query, [id_playlist], (err, result) => {
        if (err) {
            console.error('Error al obtener las canciones:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al obtener las canciones que contiene la playlist" });
        } else {
            res.json({ success: true, canciones_playlist: result });
        }
    });

});

/** Agregar una cancion a un playlist */
app.post('/canciones-playlist/:id_cancion', (req, res) => {

    const id_cancion = req.params.id_cancion;
    const { id_playlist } = req.body;
    const query = 'INSERT INTO DETALLE_PLAYLIST (id_playlist, id_cancion) VALUES (?, ?)';

    db.query(query, [id_playlist, id_cancion], (err, result) => {
        if (err) {
            console.error('Error al adjuntar la canción en el playlist:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al adjuntar la canción al playlist especificado" });
        } else {
            res.json({ success: true, mensaje: "Canción adjuntada correctamente" });
        }
    });

});

/** Eliminar una cancion de un playlist */
app.delete('/canciones-playlist/:id_cancion', (req, res) => {

    const id_cancion = req.params.id_cancion;
    const query = "DELETE FROM DETALLE_PLAYLIST WHERE id_cancion = ?";

    db.query(query, [id_cancion], (err, result) => {
        if (err) {
            console.error('Error al eliminar la canción del playlist:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al eliminar la canción del playlist" });
        } else {
            res.json({ success: true, mensaje: "Canción eliminada del playlist correctamente" });
        }
    });
});

// ACA INIAR A TESTESAR EN PYTHON
/** Agregar una cancion a favoritos para un usuario */
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
    const query = `SELECT
            f.id AS id_favorito,
            c.id AS id_cancion,
            c.nombre AS nombre_cancion,
            CONCAT('https://` + process.env.AWS_BUCKET_NAME + `.s3.amazonaws.com/', c.fotografia) AS url_imagen_cancion,
            c.duracion AS duracion_cancion,
            a.nombre AS nombre_artista,
            al.id AS id_album,
            al.nombre AS nombre_album,
            al.id_artista AS id_artista_album
        FROM
            FAVORITO f
        INNER JOIN
            CANCION c ON c.id = f.id_cancion
        INNER JOIN
            ARTISTA a ON a.id = c.id_artista
        INNER JOIN
            ALBUM al ON al.id = c.id_album
        WHERE
            f.id_usuario = ?;
        `;

    db.query(query, [id_usuario], (err, result) => {
        if (err) {
            console.error('Error al obtener las canciones favoritas:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al obtener las canciones favoritas" });
        } else {
            res.json({ success: true, canciones_favoritas: result });
        }
    });
});

/** Obtener una cancion si es favorita de un usuario */
app.get('/favorito-usuario/:id_usuario/:id_cancion', (req, res) => {
    const id_usuario = req.params.id_usuario;
    const id_cancion = req.params.id_cancion;
    const query = `SELECT f.id AS id_favorito, c.id AS id_cancion, c.nombre AS nombre_cancion, CONCAT('https://` + process.env.AWS_BUCKET_NAME + `.s3.amazonaws.com/', c.fotografia) AS url_imagen_cancion,
    c.duracion AS duracion_cancion, a.nombre AS nombre_artista
    FROM FAVORITO f
    INNER JOIN CANCION c ON c.id = f.id_cancion
    INNER JOIN ARTISTA a ON a.id = c.id_artista
    WHERE f.id_usuario = ? AND f.id_cancion = ?`;

    db.query(query, [id_usuario, id_cancion], (err, result) => {
        if (err) {
            console.error('Error al obtener la cancion favorita:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al obtener la cancion favorita" });
        } else {
            if (result.length <= 0) {
                res.json({ success: true, es_favorita: false });
            } else {
                res.json({ success: true, es_favorita: true });
            }
        }
    });
});

/** Eliminar una cancion de favoritos */
app.delete('/favoritos/:id_cancion/:id_usuario', (req, res) => {

    const id_cancion = req.params.id_cancion;
    const id_usuario = req.params.id_usuario;
    const query = "DELETE FROM FAVORITO WHERE id_cancion = ? AND id_usuario = ?";

    db.query(query, [id_cancion, id_usuario], (err, result) => {
        if (err) {
            console.error('Error al eliminar la canción de favoritos:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al eliminar la canción de favoritos" });
        } else {
            res.json({ success: true, mensaje: "Canción eliminada de favoritos correctamente" });
        }
    });
});

/** El usuario puede realizar la busqueda de albumes, canciones o artistas por medio de la entrada del usuario. */
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
app.post('/playlists', upload.single('archivo'), (req, res) => {

    const { nombre, id_usuario } = req.body;
    uploadFiletoS3(req.file, process.env.AWS_BUCKET_FOLDER_FOTOS, (err, data) => {
        if (err) {
            console.error('Error al subir el archivo de S3:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al subir el archivo" });
        } else {
            const url_archivo = data;
            const query_insert = 'INSERT INTO PLAYLIST (nombre, fondo_portada, id_usuario) VALUES (?, ?, ?)';
            db.query(query_insert, [nombre, url_archivo, id_usuario], (err, result) => {
                if (err) {
                    console.error('Error al insertar la playlist:', err);
                    res.json({ success: false, mensaje: "Ha ocurrido un error al insertar la playlist" });
                } else {
                    res.json({ success: true, mensaje: "Playlist creada correctamente" });
                }
            });
        }
    });

});

/** Obtener todas las playlists */
app.get('/playlists', (req, res) => {

    const query = `SELECT p.id, p.nombre,
    CONCAT('https://` + process.env.AWS_BUCKET_NAME + `.s3.amazonaws.com/', p.fondo_portada) AS url_imagen
    FROM PLAYLIST p`;

    db.query(query, (err, result) => {
        if (err) {
            console.error('Error al obtener las playlists:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al obtener las playlists" });
        } else {
            res.json({ success: true, playlists: result });
        }
    });

});

/** Actualizar una playlist por su ID */
app.put('/playlists/:id_playlist', upload.single('archivo'), (req, res) => {
    const id_playlist = req.params.id_playlist;
    const { nombre } = req.body;
    const query_select_fotografia = 'SELECT fondo_portada FROM PLAYLIST WHERE id = ?';

    db.query(query_select_fotografia, [id_playlist], (err, result) => {
        if (err) {
            console.error('Error al obtener la URL del archivo a modificar:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al obtener la URL del archivo a modificar" });
        } else {
            deleteFiletoS3(result[0].fondo_portada, (err, data) => {
                if (err) {
                    console.error('Error al eliminar la imagen de S3:', err);
                    res.json({ success: false, mensaje: "Ha ocurrido un error al eliminar la imagen" });
                } else {
                    uploadFiletoS3(req.file, process.env.AWS_BUCKET_FOLDER_FOTOS, (err, data) => {
                        if (err) {
                            console.error('Error al subir el archivo de S3:', err);
                            res.json({ success: false, mensaje: "Ha ocurrido un error al subir el archivo" });
                        } else {
                            const url_imagen = data;
                            const query = 'UPDATE PLAYLIST SET nombre = ?, fondo_portada = ? WHERE id = ?';
                            db.query(query, [nombre, url_imagen, id_playlist], (err, result) => {
                                if (err) {
                                    console.error('Error al actualizar la playlist:', err);
                                    res.json({ success: false, mensaje: "Ha ocurrido un error al actualizar la playlist" });
                                } else {
                                    res.json({ success: true, mensaje: "Playlist actualizada correctamente" });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

/** Eliminar una playlist por su ID */
app.delete('/playlists/:id', (req, res) => {
    const id = req.params.id;
    const query = 'DELETE FROM PLAYLIST WHERE id = ?';

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar la playlist:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al eliminar la playlist" });
        } else {
            res.json({ success: true, mensaje: "Playlist eliminada correctamente" });
        }
    });
});

/** Agrega una cancion a una playlist */
app.post('/playlist-canciones', (req, res) => {
    const { id_playlist, id_cancion } = req.body;
    const query = 'INSERT INTO DETALLE_PLAYLIST (id_playlist, id_cancion) VALUES (?, ?)';

    db.query(query, [id_playlist, id_cancion], (err, result) => {
        if (err) {
            console.error('Error al agregar la cancion a la playlist:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al agregar la cancion a la playlist" });
        } else {
            res.json({ success: true, mensaje: "Cancion agregada correctamente a la playlist" });
        }
    });
});

/** Obtener el detalle de una playlist por su ID */
app.get('/playlist-canciones/:id', (req, res) => {

    const id_playlist = req.params.id;
    const query = `SELECT c.id, c.nombre, c.fotografia, c.archivo_mp3
        FROM PLAYLIST p
        INNER JOIN DETALLE_PLAYLIST dp ON dp.id_playlist = p.id
        INNER JOIN CANCION c ON c.id = dp.id_cancion
        WHERE p.id = ?`;

    db.query(query, [id_playlist], (err, result) => {
        if (err) {
            console.error('Error al obtener la playlist:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al obtener la playlist" });
        } else {
            if (result.length > 0) {
                res.json({ success: true, playlist: result });
            } else {
                res.json({ success: false, mensaje: "Playlist no encontrada" });
            }
        }
    });
});

/** Eliminar una cancion de una playlist por su ID */
app.delete('/playlist-canciones/:id_cancion', (req, res) => {

    const id_cancion = req.params.id_cancion;
    const query = 'DELETE FROM DETALLE_PLAYLIST WHERE id = ?';

    db.query(query, [id_cancion], (err, result) => {
        if (err) {
            console.error('Error al eliminar la cancion de la playlist:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al eliminar la cancion de la playlist" });
        } else {
            res.json({ success: true, mensaje: "Cancion eliminada de la playlist correctamente" });
        }
    });
});

/** Agrega una cancion al historial del usuario */
app.post('/historicos', (req, res) => {
    const { id_usuario, id_cancion } = req.body;
    const query = 'INSERT INTO HISTORICO (id_usuario, id_cancion) VALUES (?, ?)';

    db.query(query, [id_usuario, id_cancion], (err, result) => {
        if (err) {
            console.error('Error al agregar el historico:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al agregar el historico" });
        } else {
            res.json({ success: true, mensaje: "Historico agregado correctamente" });
        }
    });
});

/** Top 5 canciones mas reproducidas */
app.get('/top5-canciones/:id_usuario', (req, res) => {
    const id_usuario = req.params.id_usuario;
    const query = `SELECT c.id AS id_cancion, c.nombre AS nombre_cancion, c.fotografia, c.duracion, a.id AS id_artista, a.nombre AS nombre_artista, al.id AS id_album, al.nombre AS nombre_album, COUNT(h.id) AS cantidad
        FROM HISTORICO h
        INNER JOIN CANCION c ON c.id = h.id_cancion
        INNER JOIN ARTISTA a ON a.id = c.id_artista
        LEFT JOIN ALBUM al ON al.id = c.id_album
        WHERE h.id_usuario = ?
        GROUP BY c.id
        ORDER BY cantidad DESC
        LIMIT 5;`;

    db.query(query, [id_usuario], (err, result) => {
        if (err) {
            console.error('Error al obtener los datos:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al obtener los datos" });
        } else {
            res.json({ success: true, data: result });
        }
    });
});

/** Top 3 artistas mas escuchados */
app.get('/top3-artistas/:id_usuario', (req, res) => {
    const id_usuario = req.params.id_usuario;
    const query = `SELECT a.id AS id_artista, a.nombre AS nombre_artista, COUNT(h.id) AS cantidad
        FROM HISTORICO h
        INNER JOIN CANCION c ON c.id = h.id_cancion
        INNER JOIN ARTISTA a ON a.id = c.id_artista
        WHERE h.id_usuario = ?
        GROUP BY a.id
        ORDER BY cantidad DESC
        LIMIT 3`;

    db.query(query, [id_usuario], (err, result) => {
        if (err) {
            console.error('Error al obtener los datos:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al obtener los datos" });
        } else {
            res.json({ success: true, data: result });
        }
    });
});

/** Top 5 albumes mas reproducidos */
app.get('/top5-albumes/:id_usuario', (req, res) => {
    const id_usuario = req.params.id_usuario;
    const query = `SELECT a.id AS id_album, a.nombre AS nombre_album, a.imagen_portada, ar.id AS id_artista, ar.nombre AS nombre_artista, COUNT(h.id) AS cantidad
        FROM HISTORICO h
        INNER JOIN CANCION c ON c.id = h.id_cancion
        INNER JOIN ALBUM a ON a.id = c.id_album
        INNER JOIN ARTISTA ar ON ar.id = a.id_artista
        WHERE h.id_usuario = ?
        GROUP BY a.id
        ORDER BY cantidad DESC
        LIMIT 5;`;

    db.query(query, [id_usuario], (err, result) => {
        if (err) {
            console.error('Error al obtener los datos:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al obtener los datos" });
        } else {
            res.json({ success: true, data: result });
        }
    });
});

/** Historial de canciones reproducidas */
app.get('/historial/:id_usuario', (req, res) => {
    const id_usuario = req.params.id_usuario;
    const query = `SELECT c.id AS id_cancion,  c.nombre,  c.fotografia,  c.duracion,  DATE_FORMAT(h.fecha_registro, '%d/%m/%Y %H:%i:%s') AS fecha_registro, a.id AS id_album, a.nombre AS nombre_album, art.id AS id_artista, art.nombre AS nombre_artista
        FROM HISTORICO h
        INNER JOIN CANCION c ON c.id = h.id_cancion
        LEFT JOIN ALBUM a ON a.id = c.id_album
        LEFT JOIN ARTISTA art ON art.id = c.id_artista
        WHERE h.id_usuario = ?
        ORDER BY h.fecha_registro DESC;
`;

    db.query(query, [id_usuario], (err, result) => {
        if (err) {
            console.error('Error al obtener los datos:', err);
            res.json({ success: false, mensaje: "Ha ocurrido un error al obtener los datos" });
        } else {
            res.json({ success: true, data: result });
        }
    });
});

/**
 *
{
    "success": true,
    "artistas": [
        {
            "id": 3,
            "nombre": "Artista 1",
            "url_imagen": "https://multimediasemi1-g2.s3.amazonaws.com/Fotos/1696479587839.jpg",
            "fecha_nacimiento": "01/01/2023",
            "fecha_formateada": "2023-01-01"
        }
    ]
}


{
    "artistas": [
        {
            "fecha_formateada": "2023-01-01",
            "fecha_nacimiento": "01/01/2023",
            "id": 3,
            "nombre": "Artista 1",
            "url_imagen": "https://multimediasemi1-g2.s3.amazonaws.com/Fotos/1696479587839.jpg"
        }
    ],
    "success": true
}
 */

/** Inicia el servidor y hace que escuche en el puerto especificado */
app.listen(port, host, () => {
    console.log(`La API está escuchando en http://${host}:${port}`);
});
