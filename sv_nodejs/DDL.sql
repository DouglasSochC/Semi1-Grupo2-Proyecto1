DROP DATABASE IF EXISTS semi1_p1;
CREATE DATABASE semi1_p1;
USE semi1_p1;

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

-- De aqui hacia abajo hay que analizar en el caso que se elimine un artista que se debe de hacer

CREATE TABLE CANCION (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    fotografia VARCHAR(255),
    duracion TIME,
    archivo_mp3 VARCHAR(255),
    id_artista INT NOT NULL,
    id_album INT,
    FOREIGN KEY (id_artista) REFERENCES ARTISTA(id),
    FOREIGN KEY (id_album) REFERENCES ALBUM(id)
);

CREATE TABLE FAVORITO (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_cancion INT NOT NULL,
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_cancion) REFERENCES CANCION(id),
    FOREIGN KEY (id_usuario) REFERENCES USUARIO(id)
);

CREATE TABLE PLAYLIST (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    fondo_portada VARCHAR(255)
);

CREATE TABLE DETALLE_PLAYLIST (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_playlist INT NOT NULL,
    id_cancion INT NOT NULL,
    FOREIGN KEY (id_playlist) REFERENCES PLAYLIST(id),
    FOREIGN KEY (id_cancion) REFERENCES CANCION(id)
);

CREATE TABLE HISTORICO (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    id_cancion INT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES USUARIO(id),
    FOREIGN KEY (id_cancion) REFERENCES CANCION(id)
);
