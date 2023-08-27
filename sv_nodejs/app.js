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

/** Inicia el servidor y hace que escuche en el puerto especificado */
app.listen(port, host, () => {
    console.log(`La API está escuchando en http://${host}:${port}`);
});
