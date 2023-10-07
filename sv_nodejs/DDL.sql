DROP DATABASE IF EXISTS semi_p1;
CREATE DATABASE semi_p1;
USE semi_p1;

CREATE TABLE USUARIO (
    id INT PRIMARY KEY AUTO_INCREMENT,
    correo VARCHAR(100) NOT NULL,
    contrasenia VARCHAR(100) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    foto VARCHAR(255),
    fecha_nacimiento DATE,
    es_administrador BOOLEAN
);

CREATE TABLE ARTISTA (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    fotografia VARCHAR(255) NOT NULL,
    fecha_nacimiento DATE
);

CREATE TABLE ALBUM (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    imagen_portada VARCHAR(255) NOT NULL,
    id_artista INT NOT NULL,
    FOREIGN KEY (id_artista) REFERENCES ARTISTA(id) ON DELETE CASCADE
);

CREATE TABLE CANCION (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    fotografia VARCHAR(255) NOT NULL,
    duracion TIME NOT NULL,
    archivo_mp3 VARCHAR(255) NOT NULL,
    id_artista INT NOT NULL,
    id_album INT,
    FOREIGN KEY (id_artista) REFERENCES ARTISTA(id) ON DELETE CASCADE,
    FOREIGN KEY (id_album) REFERENCES ALBUM(id) ON DELETE CASCADE
);

CREATE TABLE FAVORITO (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_cancion INT NOT NULL,
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_cancion) REFERENCES CANCION(id) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES USUARIO(id)
);

CREATE TABLE PLAYLIST (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    fondo_portada VARCHAR(255),
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES USUARIO(id)
);

CREATE TABLE DETALLE_PLAYLIST (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_playlist INT NOT NULL,
    id_cancion INT NOT NULL,
    FOREIGN KEY (id_playlist) REFERENCES PLAYLIST(id) ON DELETE CASCADE,
    FOREIGN KEY (id_cancion) REFERENCES CANCION(id) ON DELETE CASCADE
);

CREATE TABLE HISTORICO (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    id_cancion INT NOT NULL,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES USUARIO(id),
    FOREIGN KEY (id_cancion) REFERENCES CANCION(id) ON DELETE CASCADE
);

INSERT INTO USUARIO (correo, contrasenia, nombres, apellidos, foto, fecha_nacimiento, es_administrador) VALUES ('admin@gmail.com', '$2b$10$zHfR3HEypzrsJmO8ddz0xesfIPAoB3Hapo4u7yzBlGJzeiW5Pms2a', 'Administrador', 'General', null, '2023-01-01', TRUE);
