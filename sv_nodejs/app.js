require('dotenv').config();
const express = require('express');
const app = express();
const host = process.env.SV_HOST;
const port = process.env.SV_PORT;

// Middleware para manejar JSON
app.use(express.json());

// Endpoint inicial
app.get('/', (req, res) => {
    res.json({ message: '¡Hola!' });
});

// Inicia el servidor y hace que escuche en el puerto especificado
app.listen(port, host, () => {
    console.log(`La API está escuchando en http://${host}:${port}`);
});
