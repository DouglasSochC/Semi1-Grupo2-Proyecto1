# Manual Usuario

## Objetivos

### General

- El objetivo general de este manual de usuario es proporcionar a los usuarios la información necesaria para que puedan utilizar de manera efectiva todas las funciones y características de la plataforma, facilitando así una experiencia de usuario óptima y satisfactoria.

### Especificos

- Familiarizar al usuario con la interfaz de la aplicación
- Explicar cómo buscar y reproducir música
- Instruir sobre la gestión de la biblioteca de música y configuraciones del perfil

## Descripción

Aplicación web inspirada en los servicios de multimedia, en donde se tendrán dos diferentes tipos de usuarios, usuario administrador que podrá subir canciones y agregarlas a álbumes, y un usuario suscriptor que puede reproducir canciones, crear playlist y agregar canciones, realizar búsquedas, y estadísticas de su cuenta.

# Sitio Web

SoundStream es una plataforma de streaming de música cuya intención es promover el arte en el territorio guatemalteco, prometiendo una experiencia robusta, confiable y amigable para sus clientes. Es una plataforma completamente en la nube, diseñada para ser utilizada en cualquier navegador Web. El sistema permite a los clientes escuchar sus canciones favoritas, crear y reproducir playlists personalizadas y escuchar la radio.
A continuación, se describen las secciones que contendrá el sitio web:

# Login

Para la autenticación se realizará por medio de las credenciales: 

- Correo electronico
- Contraseña

<aside>
💡 Ya se tiene un usuario administrador

</aside>

![Untitled](Manual%20Usuario%20fb812097df934a0595ae33e08d72d953/Untitled.png)

# Registro

Para registrar un nuevo usuario obligatoriamente se pedirán los datos

- Nombres
- Apellidos
- Foto del usuario
- Correo electronico
- Contraseña
- Confirmación de contraseña
- Fecha de nacimiento del usuario

<aside>
⚠️ La foto del usuario será obligatoria, esta se realizará eligiendo una imagen del ordenador.

</aside>

![Untitled](Manual%20Usuario%20fb812097df934a0595ae33e08d72d953/Untitled%201.png)

# Página principal (Inicio) [Normal]

Esta es la página principal de la aplicación web, es la primera en aparecer luego de iniciar sesión. En ella se encuentra:

- Barra de navegación
- Un listado de canciones, álbumes y artistas disponibles
- Reproductor de música

![Untitled](Manual%20Usuario%20fb812097df934a0595ae33e08d72d953/Untitled%202.png)

<aside>
⚠️ El reproductor de música es visible en todo momento y además el audio es reproducido en todo momento.

</aside>

## Navegación

Esta sección contiene los diferentes módulos que tiene la aplicación por parte de un usuario normal.

- Buscar: Permite realizar una búsqueda por nombre de una canción, álbum o artista.
- Reproduciendo: Muestra la información de los audios que se han reproducido
- Playlist: El usuario puede gestionar sus playlist.
- Favoritos: Lista las canciones que el usuario le dio ‘Me gusta’
- Histórico: Este es un módulo de reportes.
- Radio: Reproduce de forma aleatoria todas las canciones.

![Untitled](Manual%20Usuario%20fb812097df934a0595ae33e08d72d953/Untitled%203.png)

## Perfil

En esta sección el usuario puede ver y modificar sus datos tales como:

- Nombre
- Apellido
- Foto de perfil
- Correo electrónico

<aside>
⚠️ Se debe ingresar la contraseña correcta para que se guarden los datos modificados.

</aside>

![Untitled](Manual%20Usuario%20fb812097df934a0595ae33e08d72d953/Untitled%204.png)

## Buscar

El usuario puede realizar la búsqueda de álbumes, canciones o artistas por medio de la entrada del usuario.

Esto se realiza en la página principal, por lo cual, se muestra la portada de cada canción, álbum o artista.

![Untitled](Manual%20Usuario%20fb812097df934a0595ae33e08d72d953/Untitled%205.png)

Cada vez que el usuario quiera seleccionar cualquiera de las 3 opciones obtendrá los siguientes formularios.

### Canción

Aquí el usuario puede reproducir la canción, agregar la canción a la reproducción actual o podrá agregarla a favoritos.

![Untitled](Manual%20Usuario%20fb812097df934a0595ae33e08d72d953/Untitled%206.png)

### Álbum

Aquí el usuario puede reproducir el álbum completo, además, puede agregar el álbum a la reproducción actual.

![Untitled](Manual%20Usuario%20fb812097df934a0595ae33e08d72d953/Untitled%207.png)

### Artista

Aquí el usuario puede ver todas las canciones que ha creado un artista, además de que puede reproducir una canción.

![Untitled](Manual%20Usuario%20fb812097df934a0595ae33e08d72d953/Untitled%208.png)

## Playlist

En esta pantalla el suscriptor puede hacer uso de playlist para un mejor control de sus canciones.

En este modulo el usuario puede crear la cantidad de playlist que desee. Por otra parte, el usuario puede agregar una canción a la playlist deseada, como también puede eliminarla.

![Untitled](Manual%20Usuario%20fb812097df934a0595ae33e08d72d953/Untitled%209.png)

## Favoritos

En esta pantalla se visualizará el listado de las canciones a las que el usuario le dio ‘Me gusta’.

![Untitled](Manual%20Usuario%20fb812097df934a0595ae33e08d72d953/Untitled%2010.png)

## Histórico

En esta sección aparecerán estadísticas de la cuenta del usuario, los cuales son:

- Top 5 canciones más reproducidas.
- Top 3 artistas más escuchados.
- Top 5 álbumes más reproducidos.
- Historial de canciones reproducidas

![Untitled](Manual%20Usuario%20fb812097df934a0595ae33e08d72d953/Untitled%2011.png)

### Reproducción de música

El reproductor de música siempre se verá independientemente de la pantalla en la que este ubicado el usuario, por lo cual el podrá, pausar/reanudar un audio, como al igual podrá subir/bajar el volumen.

En el caso que el usuario este reproduciendo un conjunto de canciones, este podrá hacer uso de los botones de atrás/adelante para movilizarse de canción en canción.

![Untitled](Manual%20Usuario%20fb812097df934a0595ae33e08d72d953/Untitled%2012.png)

# Página principal (Inicio) [Administrador]

Esta pantalla de usuario con rol administrador debe mostrar el acceso a las funcionalidades CRUD de las siguientes entidades.

- Artista
- Álbum
- Canción

![Untitled](Manual%20Usuario%20fb812097df934a0595ae33e08d72d953/Untitled%2013.png)

## Artista.

En este modulo puede crear, modificar y eliminar el artista.

Los parámetros que serán solicitado son los siguientes:

- Nombre
- Fotografía
- Fecha de nacimiento

<aside>
⚠️ Para confirmar la eliminación de un artista se necesita confirmar la contraseña del usuario administrador.

</aside>

![Untitled](Manual%20Usuario%20fb812097df934a0595ae33e08d72d953/Untitled%2014.png)

## Álbum

En este modulo puede crear, modificar y eliminar el álbum.

Los parámetros que serán solicitado son los siguientes:

- Nombre
- Descripción
- Imagen de portada
- Artista

<aside>
⚠️ Para confirmar la eliminación de un álbum se necesita confirmar la contraseña del usuario administrador.

</aside>

![Untitled](Manual%20Usuario%20fb812097df934a0595ae33e08d72d953/Untitled%2015.png)

## Canción

En este modulo puede crear, modificar y eliminar una canción.

En esta pantalla se realizan las siguientes acciones

Los parámetros que serán solicitados son los siguientes:

- Nombre
- Fotografía
- Duración
- Artista
- Archivo MP3

![Untitled](Manual%20Usuario%20fb812097df934a0595ae33e08d72d953/Untitled%2016.png)

<aside>
⚠️ El usuario administrador tendrá acceso a todas las funcionalidades del usuario suscriptor.
Las canciones pueden ser reproducidas en cualquier lugar de la aplicación donde sean visibles.

</aside>