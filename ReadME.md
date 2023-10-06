# Manual Técnico

*Aplicación web inspirada en los servicios de multimedia, en donde se tendrán dos diferentes tipos de usuarios, usuario administrador que podrá subir canciones y agregarlas a álbumes, y un usuario suscriptor que puede reproducir canciones, crear playlist y agregar canciones, realizar búsquedas, y estadísticas de su cuenta.*

# 🚀 Comenzando

---

## **Requerimientos**

- **Backend**
    - [NodeJS 20](https://nodejs.org/download/release/v20.7.0/)
    - [MySQL 8](https://dev.mysql.com/downloads/installer/)
- **Frontend**
    - ReactJS

# 🔎 Objetivos del manual

---

## Módulos

- Usuario
- Artistas
- Álbumes
- Canciones
- PlayList
- Favoritos
- Reportes

## Convención de un Endpoint

Las convenciones para nombrar y diseñar endpoints en una API son importantes para mantener una estructura clara y coherente en la API, facilitando su comprensión y uso por parte de los desarrolladores.

### **Nombres descriptivos y en minúsculas**

Usa nombres descriptivos en minúsculas para los endpoints que reflejen la acción o el recurso al que acceden. 

**Por ejemplo**: 

- /usuarios
- /productos
- /ordenes.

### Utiliza sustantivos para representar recursos

Usa nombres de recursos en plural para representar colecciones de elementos

**Por ejemplo**:

- /usuario**s**
- /producto**s**
- /ordene**s**

### Usa rutas anidadas para relaciones

Para representar relaciones entre recursos, puedes utilizar rutas anidadas. 

**Por ejemplo**: 

Si un usuario tiene múltiples direcciones: 

- /usuarios/register
- /usuarios/login

### Usa verbos HTTP de manera apropiada

Utiliza los verbos HTTP de manera adecuada y descriptiva para representar la acción que se está realizando en el endpoint.

**GET**: Para obtener información.

**POST**: Para crear un nuevo recurso.

**PUT o PATCH**: Para actualizar un recurso existente.

**DELETE**: Para eliminar un recurso.

### Evita acciones en el nombre del endpoint

Evita incluir acciones en el nombre del endpoint, como "obtener", "crear", "eliminar", etc. Utiliza los verbos HTTP para indicar la acción.

## Seguridad

Es fundamental que para fortalecer la seguridad del software al gestionar y proteger información sensible y configuraciones especificas de un proyecto hay que utilizar un archivo **.env**

Es una pieza esencial en el desarrollo de software que proporciona una capa adicional de seguridad mediante la gestión de configuraciones sensibles y datos confidenciales.

<aside>
💡 El proyecto cuenta con un archivo llamado **`.env.example`** que sirve como plantilla para configuraciones utilizadas en producción. Para adaptarlo a las credenciales específicas que se emplearán en el entorno de producción, simplemente se deben modificar los datos propuestos por las credenciales reales correspondientes.

</aside>

<aside>
❌ No subas las credenciales que se emplearan en el entorno de producción

</aside>

## Endpoints

En esta sección, encontrarás información detallada sobre los distintos puntos de acceso (endpoints) disponibles en nuestra API. Cada endpoint representa un punto de interacción específico para realizar operaciones relacionadas con la API, como obtener información, enviar datos, eliminar recursos y más. 

Salvo que se especifique una estructura de respuesta distinta al consumir un endpoint específico, la estructura estándar de las respuestas es la siguiente:

```jsx
{
	"success": true|false, // Indica si la transacción se completó exitosamente
	"mensaje": "Descripción de la transacción" // Proporciona detalles sobre el resultado de la transacción
}
```

### 🟢 **[POST] /usuarios/register**

- **Descripción**
    - Crea un usuario nuevo.
- **Parámetros de la solicitud**
    - ‘correo’ *(String, obligatorio)*:  Correo electrónico utilizado para el inicio de sesión.
    - ‘contrasenia’ *(String, obligatorio)*: Correo electrónico utilizado para el inicio de sesión.
    - ‘nombres’ *(String, obligatorio)*: Nombres del usuario.
    - ‘apellidos’ *(String, obligatorio)*: Apellidos del usuario.
    - ‘archivo’ *(File)*: Foto del usuario.
    - ‘fecha_nacimiento’ *(String, obligatorio)*: Fecha de nacimiento del usuario
        
        <aside>
        ⚠️ El formato para la fecha de nacimiento debe ser 'YYYY-MM-DD'
        
        </aside>
        
    - ‘es_administrador’ *(Boolean, obligatorio)*: Indica si el usuario que se está registrando es un administrador del sistema.
- **Content-Type de la solicitud**
    - multipart/form-data
- **Estructura de la respuesta**
    
    ```json
    {
    	"success": true|false, // Indica si la transacción se completó exitosamente
    	"mensaje": "Descripción de la transacción" // Proporciona detalles sobre el resultado de la transacción
    	"id_insertado": [Numerico] // Indica el indice asignado del usuario creado
    }
    ```
    

### 🟢 **[POST] /usuarios/login**

- **Descripción**
    - Inicio de sesión de un usuario registrado.
- **Parámetros de la solicitud**
    - ‘correo’ *(String, obligatorio)*: Correo del usuario
    - ‘contrasenia’ *(String, obligatorio)*: Contraseña del usuario
- **Content-Type de la solicitud**
    - application/json

### 🟠 [PUT] /usuarios/:id_usuario/:contrasenia

- **Descripción**
    - Actualiza los datos generales de un usuario.
- **Parámetros de la URL**
    - ‘id_usuario’ *(Integer, obligatorio)*: Identificador único del usuario autenticado en el sistema.
    - ‘contrasenia’ *(String, obligatorio)*:Contraseña actual del usuario autenticado, necesaria para autorizar la modificación de los datos asociados a dicho usuario.
- **Parámetros de la solicitud**
    - ‘correo’ *(String, obligatorio)*:  Correo electrónico utilizado para el inicio de sesión.
    - ‘nombres’ *(String, obligatorio)*: Nombres del usuario.
    - ‘apellidos’ *(String, obligatorio)*: Apellidos del usuario.
    - ‘archivo’ *(File)*: Foto del usuario.
- **Content-Type de la solicitud**
    - multipart/form-data

### 🟢 **[POST] /artistas**

- **Descripción**
    - Crea un artista nuevo.
- **Parámetros de la solicitud**
    - ‘nombre’ *(String, obligatorio)*: Nombre del artista.
    - ‘archivo’ *(File, obligatorio)*: Foto del artista.
    - ‘fecha_nacimiento’ *(String)*: Fecha de nacimiento del artista
        
        <aside>
        ⚠️ El formato para la fecha de nacimiento debe ser 'YYYY-MM-DD'
        
        </aside>
        
- **Content-Type de la solicitud**
    - multipart/form-data

### 🟣 [GET] /artistas

- **Descripción**
    - Obtiene todos los artistas existentes.
- **Estructura de la respuesta**
    
    ```json
    {
    	"success": true,
    	"artistas": [
    		{
    			"id": 1,
    			"nombre": "Nombre del artista 1",
    			"url_imagen": "URL de la imagen del artista 1",
    			"fecha_nacimiento": "Fecha de nacimiento del artista 1", // Formato DD/MM/YYYY
    			"fecha_formateada": "Fecha de nacimiento del artista 1" // Formato YYYY-MM-DD
    		},
    		{
    			...
    		},
    		{
    			"id": N,
    			"nombre": "Nombre del artista N",
    			"url_imagen": "URL de la imagen del artista N",
    			"fecha_nacimiento": "Fecha de nacimiento del artista N", // Formato DD/MM/YYYY
    			"fecha_formateada": "Fecha de nacimiento del artista N" // Formato YYYY-MM-DD
    		}
    	]
    }
    ```
    

### 🟠 [PUT] /artistas/:id_artista

- **Descripción**
    - Actualiza los datos generales de un artista.
- **Parámetros de la URL**
    - ‘id_artista’ *(Integer, obligatorio)*: Identificador único del artista.
- **Parámetros de la solicitud**
    - ‘nombre’ *(String, obligatorio)*: Nombre del artista.
    - ‘archivo’ *(File, obligatorio)*: Foto del artista.
    - ‘fecha_nacimiento’ *(String)*: Fecha de nacimiento del artista
        
        <aside>
        ⚠️ El formato para la fecha de nacimiento debe ser 'YYYY-MM-DD'
        
        </aside>
        
- **Content-Type de la solicitud**
    - multipart/form-data

### 🔴 [DELETE] /artistas/:id_artista

- **Descripción**
    - Elimina un artista.
- **Parámetros de la URL**
    - ‘id_artista’ *(Integer, obligatorio)*: Identificador único del artista.

### 🟢 **[POST] /albumes**

- **Descripción**
    - Crea un nuevo album.
- **Parámetros de la solicitud**
    - ‘nombre’ *(String, obligatorio)*: Nombre del álbum.
    - ‘descripcion’ *(String)*: Descripción del álbum.
    - ‘archivo’ *(File, obligatorio)*: Foto del álbum.
    - ‘id_artista’ *(Integer, obligatorio)*: Identificador único del artista que es el creador o autor del álbum. Este campo establece la relación entre el álbum y el artista responsable de su creación.
- **Content-Type de la solicitud**
    - multipart/form-data

### 🟠 [PUT] /albumes/:id_album

- **Descripción**
    - Actualiza los datos generales de un álbum.
- **Parámetros de la URL**
    - ‘id_album’ *(Integer, obligatorio)*: Identificador único del álbum.
- **Parámetros de la solicitud**
    - ‘nombre’ *(String, obligatorio)*: Nombre del álbum.
    - ‘descripcion’ *(String)*: Descripción del álbum.
    - ‘archivo’ *(File, obligatorio)*: Foto del álbum.
    - ‘id_artista’ *(Integer, obligatorio)*: Identificador único del artista que es el creador o autor del álbum. Este campo establece la relación entre el álbum y el artista responsable de su creación.
- **Content-Type de la solicitud**
    - multipart/form-data

### 🔴 [DELETE] /albumes/:id_album

- **Descripción**
    - Elimina un álbum.
- **Parámetros de la URL**
    - ‘id_album’ *(Integer, obligatorio)*: Identificador único del álbum.

### 🟢 **[POST] /canciones**

- **Descripción**
    - Crea un canción nueva.
- **Parámetros de la solicitud**
    - ‘nombre’ *(String, obligatorio)*: Nombre de la canción.
    - ‘imagen_portada’ *(File, obligatorio)*: Foto de la portada de la canción.
    - ‘duracion’ *(Integer, obligatorio)*: Duración del audio de la canción.
    - ‘archivo_mp3’ *(File, obligatorio)*: Audio de la canción.
    - ‘id_artista’ *(Integer, obligatorio)*: Identificador único del artista que es el creador o autor de la canción. Este campo establece la relación entre la canción y el artista responsable de su creación.
    - ‘id_album’ *(Integer)*: Identificador único del álbum que es el donde pertenece la canción. Este campo establece la relación entre el álbum y la canción.
- **Content-Type de la solicitud**
    - multipart/form-data

### 🟣 [GET] /canciones

- **Descripción**
    - Obtiene todas las canciones existentes.
- **Estructura de la respuesta**
    
    ```json
    {
    	"success": true,
    	"canciones": [
    		{
    			"id_cancion": 1,
    			"nombre_cancion": "Cancion 1",
    			"duracion": "00:01:00",
    			"id_artista": 1,
    			"nombre_artista": "Artista 1",
    			"url_imagen": "URL de la imagen",
    			"url_audio": "URL del audio"
    		},
    		{
    			...
    		},
    		{
    			"id_cancion": N,
    			"nombre_cancion": "Cancion N",
    			"duracion": "00:00:00",
    			"id_artista": N,
    			"nombre_artista": "Artista N",
    			"url_imagen": "URL de la imagen",
    			"url_audio": "URL de la imagen"
    		}
    	]
    }
    ```
    

### 🟠 [PUT] /canciones/:id_cancion

- **Descripción**
    - Actualiza los datos generales de una canción.
- **Parámetros de la URL**
    - ‘id_cancion’ *(Integer, obligatorio)*: Identificador único de la canción.
- **Parámetros de la solicitud**
    - ‘nombre’ *(String, obligatorio)*: Nombre de la canción.
    - ‘imagen_portada’ *(File, obligatorio)*: Foto de la portada de la canción.
    - ‘duracion’ *(Integer, obligatorio)*: Duración del audio de la canción.
    - ‘archivo_mp3’ *(File, obligatorio)*: Audio de la canción.
    - ‘id_artista’ *(Integer, obligatorio)*: Identificador único del artista que es el creador o autor de la canción. Este campo establece la relación entre la canción y el artista responsable de su creación.
    - ‘id_album’ *(Integer)*: Identificador único del álbum que indica donde pertenece la canción. Este campo establece la relación entre el álbum y la canción.
- **Content-Type de la solicitud**
    - multipart/form-data

### 🔴 [DELETE] /canciones/:id_cancion

- **Descripción**
    - Elimina una canción.
- **Parámetros de la URL**
    - ‘id_cancion’ *(Integer, obligatorio)*: Identificador único de la canción.

### 🟣 [GET] /canciones-artista/:id_artista

- **Descripción**
    - Obtiene todas las canciones que pertenecen al artista (según el id_artista) y que no estén agregadas a un álbum.
- **Parámetros de la URL**
    - ‘id_artista’ *(Integer, obligatorio)*: Identificador único del artista.
- **Estructura de la respuesta**
    
    ```json
    {
    	"success": true,
    	"canciones_artista": [
    		{
    			"id_cancion": 1,
    			"nombre_cancion": "Cancion 1",
    			"url_imagen_cancion": "URL de la imagen de la canción",
    			"duracion_cancion": "00:00:00",
    			"nombre_artista": "Artista 1"
    		},
    		{
    			...
    		},
    		{
    			"id_cancion": N,
    			"nombre_cancion": "Cancion N",
    			"url_imagen_cancion": "URL de la imagen de la canción",
    			"duracion_cancion": "00:0N:00",
    			"nombre_artista": "Artista N"
    		}
    	]
    }
    ```
    

### 🟣 [GET] /canciones-album/:id_album

- **Descripción**
    - Obtiene todas las canciones que pertenecen a un álbum (según el id_album).
- **Parámetros de la URL**
    - ‘id_album’ *(Integer, obligatorio)*: Identificador único del álbum.
- **Estructura de la respuesta**
    
    ```json
    {
    	"success": true,
    	"canciones_album": [
    		{
    			"id_cancion": 1,
    			"nombre_cancion": "Cancion 1",
    			"url_imagen_cancion": "URL de la imagen de la canción",
    			"duracion_cancion": "00:01:00",
    			"nombre_artista": "Artista 1"
    		},
    		{
    			...
    		},
    		{
    			"id_cancion": N,
    			"nombre_cancion": "Cancion N",
    			"url_imagen_cancion": "URL de la imagen de la canción",
    			"duracion_cancion": "00:01:00",
    			"nombre_artista": "Artista 1"
    		}
    	]
    }
    ```
    

### 🟠 [PUT] /canciones-album/:id_cancion

- **Descripción**
    - Actualiza el álbum al que pertenece una única canción. Esto quiere decir que la canción contará un álbum asignado.
- **Parámetros de la URL**
    - ‘id_cancion’ *(Integer, obligatorio)*: Identificador único de la canción.
- **Parámetros de la solicitud**
    - ‘id_album’ *(Integer, obligatorio)*: Identificador único del álbum que indica donde pertenece la canción. Este campo establece la relación entre el álbum y la canción.
- **Content-Type de la solicitud**
    - application/json

### 🔴 [DELETE] /canciones-album/:id_cancion

- **Descripción**
    - Desvincula el álbum donde pertenece la canción. Esto quiere decir que la canción no poseerá un álbum asignado.
- **Parámetros de la URL**
    - ‘id_cancion’ *(Integer, obligatorio)*: Identificador único de la canción.

### 🟢 **[POST] /favoritos**

- **Descripción**
    - Agrega una canción a la sección de favoritos.
- **Parámetros de la solicitud**
    - ‘id_usuario’ *(Integer, obligatorio)*: Identificador único de un usuario.
    - ‘id_cancion’ *(Integer, obligatorio)*: Identificador único de la canción a añadir.
- **Content-Type de la solicitud**
    - application/json

### 🟣 [GET] /favoritos/:id_usuario

- **Descripción**
    - Obtiene todas las canciones favoritas de un usuario.
- **Parámetros de la URL**
    - ‘id_usuario’ *(Integer, obligatorio)*: Identificador único del usuario que ha iniciado sesión.
- **Estructura de la respuesta**
    
    ```json
    {
    	"success": true,
    	"canciones_favoritas": [
    		{
    			"id_favorito": 1,
    			"id_cancion": 1,
    			"nombre_cancion": "Cancion 1",
    			"url_imagen_cancion": "URL de la imagen de la canción",
    			"duracion_cancion": "00:01:00",
    			"nombre_artista": "Artista 1"
    		},
    		{
    			...
    		},
    		{
    			"id_favorito": N,
    			"id_cancion": N,
    			"nombre_cancion": "Cancion N",
    			"url_imagen_cancion": "URL de la imagen de la canción",
    			"duracion_cancion": "00:0N:00",
    			"nombre_artista": "Artista N"
    		}
    	]
    }
    ```
    

### 🔴 [DELETE] /favoritos/:id_favorito

- **Descripción**
    - Elimina una canción de la sección de favoritos.
- **Parámetros de la URL**
    - ‘id_favorito’ *(Integer, obligatorio)*: Identificador único de favorito.

### 🟣 [GET] /buscar/:entrada

- **Descripción**
    - El usuario puede realizar la búsqueda de álbumes, canciones o artistas por medio de la entrada del usuario.
- **Parámetros de la URL**
    - ‘entrada’ *(String, obligatorio)*: Texto que hará match de la siguiente forma:
        - Para el álbum: Nombre del álbum, descripción del álbum
        - Para el artista: Nombre del artista
        - Para la canción: Nombre de la canción
- **Estructura de la respuesta**
    
    ```json
    {
    	"success": true,
    	"albumes": [
    		{
    			"id_album": 1,
    			"nombre_album": "Album 1",
    			"descripcion": "Descripcion Album 1",
    			"id_artista": 1,
    			"nombre_artista": "Artista 1",
    			"detalle_album": [
    				{
    					"id_cancion": 1,
    					"nombre_cancion": "Cancion 1",
    					"duracion_cancion": "00:00:01.000000"
    				},
    				{
    					"id_cancion": 2,
    					"nombre_cancion": "Cancion 2",
    					"duracion_cancion": "00:00:02.000000"
    				}
    			]
    		},
    		{...},
    		{
    			"id_album": N,
    			"nombre_album": "Album N",
    			"descripcion": "Descripcion Album N",
    			"id_artista": 1,
    			"nombre_artista": "Artista N",
    			"detalle_album": [
    				{
    					"id_cancion": N,
    					"nombre_cancion": "Cancion N",
    					"duracion_cancion": "00:00:00.000000"
    				},
    				{
    					"id_cancion": M,
    					"nombre_cancion": "Cancion M",
    					"duracion_cancion": "00:00:00.000000"
    				}
    			]
    		}
    	],
    	"canciones_artista": [
    		{
    			"id_cancion": 1,
    			"nombre": "Cancion 1",
    			"fotografia": "foto1",
    			"duracion": "00:00:01",
    			"archivo_mp3": "sonido1",
    			"id_artista": 1,
    			"nombre_artista": "Artista 1"
    		},
    		{...},
    		{
    			"id_cancion": N,
    			"nombre": "Cancion N",
    			"fotografia": "fotoN",
    			"duracion": "00:00:00",
    			"archivo_mp3": "sonidoN",
    			"id_artista": X,
    			"nombre_artista": "Artista X"
    		}
    	],
    	"canciones": [
    		{
    			"id_cancion": 1,
    			"nombre": "Cancion 1",
    			"fotografia": "foto1",
    			"duracion": "00:00:01",
    			"archivo_mp3": "sonido1",
    			"id_artista": 1,
    			"nombre_artista": "Artista 1"
    		},
    		{...},
    		{
    			"id_cancion": N,
    			"nombre": "Cancion N",
    			"fotografia": "fotoN",
    			"duracion": "00:00:00",
    			"archivo_mp3": "sonidoN",
    			"id_artista": X,
    			"nombre_artista": "Artista X"
    		}
    	]
    }
    ```
    

# 🌁 Arquitectura de la aplicación

---

![Figura 1. Elaboración propia.](Manual%20Te%CC%81cnico%20896c602379284fcb99329fcb24dd0a57/P1_SEMI1.drawio.png)

Figura 1. Elaboración propia.

La arquitectura anterior demuestra como funcionaran todos los servicios de AWS internamente
en nuestra aplicación.

## S3

1. La aplicación está alojada dentro de un Bucket funcionando como un sitio web estático.
2. Los archivos mp3 y todas las imágenes tanto de perfil, artista, álbum y del la playlist que se suban dentro de la aplicación están dentro de un Bucket configurado con las políticas públicas para poder ser accedido desde nuestra aplicación.

## EC2

1. En una instancia se montara el servidor NodeJS
2. En una instancia se montara el servidor Python

<aside>
⚠️ Asegurarse de habilitar únicamente los puertos necesarios para su aplicación en los Security Groups de cada instancia.

</aside>

## Load Balancer

Se configurará 1 balanceador de carga donde estará verificando el estado de los 2 servidores de las EC2. Este es el que se tiene que consumir desde la aplicación, ya que como se sabe este redirecciona la solicitud a alguno de los servidores disponibles. Se verificará que es el que se consume desde la aplicación y no los servidores como tal.

## RDS o DynamoDB

Se utilizará una instancia de RDS para la base de datos. 

Debe de considerar los siguientes aspectos:

- Las contraseñas de los usuarios están encriptadas.
- Los archivos e imágenes de un usuario son almacenados en un S3 por lo cual en la base de datos se almacena únicamente la URL.

## IAM

Se recomienda crear los usuarios de IAM que sean necesarios para el manejo y uso de los servicios de AWS que lo requieran con su política asociada.

**Terraform**

Terraform es una herramienta de código abierto desarrollada por HashiCorp que se utiliza
para crear, configurar y administrar infraestructuras de manera declarativa. Su objetivo
principal es permitir la creación y gestión eficiente de recursos en la nube, centros de datos
locales o cualquier otro proveedor de servicios, como AWS, Azure, Google Cloud, entre
otros.

**Características y conceptos clave de Terraform**

**Infraestructura como código (IaC):** La Infraestructura como Código (IaC) marca un
cambio fundamental en la forma en que las organizaciones abordan la administración de
sus recursos de TI. Este enfoque trata a la infraestructura como un activo de software,
permitiendo que se defina y configure utilizando código. La importancia de la IaC radica en
su capacidad para superar los desafíos históricos de la administración manual, donde las
configuraciones específicas eran difíciles de mantener y propensas a errores. Con la IaC,
las organizaciones pueden lograr coherencia en sus implementaciones, replicabilidad en
múltiples entornos y una mayor agilidad al permitir cambios mediante código en lugar de
configuraciones manuales.
**Proveedores:** Terraform es extensible y admite una amplia variedad de proveedores de
servicios en la nube y otros sistemas de infraestructura. Cada proveedor tiene su propio
conjunto de recursos que se pueden administrar a través de Terraform.
Recursos: Son componentes individuales de infraestructura que se crean y gestionan
mediante Terraform. Ejemplos de recursos pueden ser instancias de máquinas virtuales,
grupos de seguridad, redes, bases de datos, etc.
Estado: Terraform mantiene un archivo de estado que registra el estado actual de la
infraestructura. Este archivo es utilizado para planificar y aplicar cambios de manera segura
y consistente.
**Ciclo de vida:** Terraform sigue un flujo de trabajo de tres pasos: "init", "plan" y "apply".
Primero, inicializas el directorio de trabajo con el comando "terraform init", luego planificas
los cambios con "terraform plan", y finalmente, aplicas los cambios con "terraform apply".
Planificación: Antes de aplicar cambios a la infraestructura, Terraform genera un plan
detallado que muestra las acciones que tomará para alcanzar el estado deseado. Esto te
permite revisar y aprobar los cambios antes de aplicarlos.
Versionado y colaboración: Al describir la infraestructura como código, se puede utilizar
un sistema de control de versiones para rastrear los cambios en el código de Terraform.
5
Esto facilita la colaboración entre equipos y permite el despliegue consistente de la
infraestructura.
**Interoperabilidad**: Terraform puede trabajar junto con otras herramientas de administración
de configuración y automatización, como Ansible o Chef, para proporcionar una solución
completa para la gestión de infraestructura y aplicaciones.
**¿Cómo trabaja?**
Terraform trabaja siguiendo un flujo de trabajo declarativo que permite definir la
infraestructura deseada en un código, planificar los cambios y aplicarlos a la infraestructura
existente. A continuación, se explica el proceso de trabajo de Terraform paso a paso:
Definición de la configuración: El primer paso es escribir la configuración de
infraestructura deseada en un archivo de código. Terraform utiliza su propio lenguaje de
configuración llamado HashiCorp Configuration Language (HCL) o, alternativamente, el
formato JSON. En este código, se describen los recursos que se desean crear y cómo
deben configurarse.
**Inicialización (init):** Antes de poder utilizar Terraform en un directorio de trabajo, es
necesario inicializarlo. Esto se hace ejecutando el comando terraform init. Durante este
proceso, Terraform descargará los complementos (provisores) necesarios para el proveedor
de servicios en la nube especificado en la configuración. Los proveedores son responsables
de comunicarse con el API del proveedor de infraestructura (por ejemplo, AWS, Azure,
GCP) para administrar los recursos.
**Planificación (plan):** Después de inicializar el directorio, se puede ejecutar el comando
terraform plan. En este paso, Terraform examinará la configuración y comparará el estado
actual de la infraestructura con la configuración deseada. Luego, generará un plan detallado
que muestra los cambios propuestos para alcanzar el estado deseado. Esto incluye
recursos a crear, modificar o eliminar, así como cualquier cambio en la configuración de los
recursos existentes.
Revisión del plan: Antes de aplicar los cambios, es recomendable revisar el plan generado
para asegurarse de que refleje las intenciones y no contenga errores. El plan proporciona
una vista previa de los cambios que se realizarán en la infraestructura, lo que ayuda a
prevenir acciones no deseadas.
**Aplicación (apply)**: Si estás satisfecho con el plan generado, puedes aplicar los cambios
ejecutando el comando terraform apply. Terraform comenzará a crear, modificar o eliminar
los recursos según lo especificado en el plan. Durante este proceso, Terraform actualizará
su archivo de estado para reflejar el estado actual de la infraestructura.
**Gestión del estado:** Terraform mantiene un archivo de estado local (por defecto, llamado
terraform.tfstate) que registra el estado actual de la infraestructura administrada. El estado
es utilizado para mantener el seguimiento de los recursos creados y gestionados por Terraform. Es crucial no eliminar o modificar manualmente este archivo, ya que es la base
para determinar los cambios en futuras ejecuciones de Terraform.
**Administración de cambios:** A medida que los requisitos de la infraestructura cambian con
el tiempo, se pueden hacer modificaciones en el código de Terraform para reflejar esos
cambios. Una vez que el código se actualiza, se puede ejecutar el proceso de planificación
y aplicación nuevamente para implementar los cambios de manera controlada y predecible.
Terraform se diseñó con un enfoque en la seguridad y la consistencia. Su flujo de trabajo
declarativo permite que las operaciones sean idempotentes, lo que significa que ejecutar el
mismo código varias veces produce el mismo resultado, lo que facilita la administración y
evita cambios accidentales en la infraestructura. Además, el uso de código para describir la
infraestructura permite un control de versiones adecuado y fomenta las prácticas de
desarrollo colaborativas.
En resumen, Terraform es una poderosa herramienta que permite a los equipos de
desarrollo e infraestructura administrar su infraestructura de manera eficiente y escalable
mediante la descripción de recursos y configuraciones en un formato de código declarativo.
Su enfoque en la infraestructura como código facilita la automatización, la colaboración y la
adopción de buenas prácticas de administración de la infraestructura.
Amazon Virtual Private Cloud (Amazon VPC)
Con Amazon Virtual Private Cloud (Amazon VPC), se pueden lanzar recursos de AWS en
una red virtual lógicamente aislada que se haya definido.
Esta red virtual se parece mucho a una red tradicional que operaría en un propio centro de
datos, con los beneficios de usar la infraestructura escalable de AWS.
Amazon RDS (Relational Database Service)
Es un servicio administrado de bases de datos relacionales ofrecido por Amazon Web
Services (AWS).
Proporciona una manera fácil de configurar, operar y escalar bases de datos relacionales en
la nube sin la necesidad de administrar la infraestructura subyacente.
RDS es compatible con varios motores de bases de datos populares, como Amazon Aurora,
MySQL, PostgreSQL, Oracle y Microsoft SQL Server.
● **Crear aplicaciones web y móviles:** Apoye las aplicaciones en crecimiento con alta
disponibilidad, rendimiento y escalabilidad de almacenamiento. Aproveche la
7
flexibilidad de los precios de pago por uso para adaptarse a los distintos patrones de
uso de las aplicaciones.
● **Migrar a bases de datos administradas:** Innove y cree aplicaciones nuevas con
Amazon RDS en vez de preocuparse por la autoadministración de sus bases de
datos, que puede ser larga, compleja y costosa.
● **Librarse de las bases de datos heredadas:** Líbrese de las bases de datos
comerciales, caras y punitivas, mediante la migración a Amazon Aurora. Cuando
migra a Aurora, obtendrá la escalabilidad, el rendimiento y la disponibilidad de bases
de datos comerciales a una décima parte del costo.
● **Aplicaciones móviles:** Muchas aplicaciones móviles requieren una base de datos
detrás de escena para almacenar datos de usuarios y otra información relevante.
Amazon EC2 (Elastic Compute Cloud)
Es uno de los servicios fundamentales y populares ofrecidos por Amazon Web Services
(AWS). Es un servicio de infraestructura de cómputo en la nube que permite a los usuarios
alquilar máquinas virtuales escalables y configurables en la nube de Amazon.
En términos sencillos, Amazon EC2 ofrece una manera de obtener capacidad informática
bajo demanda. Permite a las empresas, desarrolladores y organizaciones obtener
fácilmente recursos de cómputo, como servidores virtuales, en la nube de AWS sin tener
que invertir en hardware físico y sin preocuparse por la gestión y mantenimiento de la
infraestructura.

# 🧩 Diagrama Entidad-Relación

![semi1_p1.png](Manual%20Te%CC%81cnico%20896c602379284fcb99329fcb24dd0a57/semi1_p1.png)

# 👥 Descripción de cada usuario de IAM creado con las políticas asociadas.

**Usuario Seminario_guest:**

Pertenece al grupo de usuarios Semi1

Dicho grupo contiene a los usuarios Administrador_201709282 y Seminario_guest

El usuario Administrador_201709282 posee las políticas Administrator Access para administración de la cuenta de AWS. 

El usuario Seminario_guest posee los permisos necesarios para trabajar en el laboratorio de Seminario de sistemas 1.

![Captura de pantalla 2023-10-05 211118.png](Manual%20Te%CC%81cnico%20896c602379284fcb99329fcb24dd0a57/Captura_de_pantalla_2023-10-05_211118.png)

# 📸 Capturas y descripción de cómo se configuró cada servicio.

## VPC

```ruby
resource "aws_vpc" "Semi1_VPC" {                # Creating VPC here
  cidr_block           = var.Semi1_vpc_cidr # Defining the CIDR block use 10.0.0.0/24 for demo
  instance_tenancy     = "default"
  enable_dns_hostnames = true
  enable_dns_support   = true
}
```

## INTERNET GATEWAY

```ruby
resource "aws_internet_gateway" "IGW" { # Creating Internet Gateway
  vpc_id = aws_vpc.Semi1_VPC.id          # vpc_id will be generated after we create VPC
}
```

## SUBNETS

```ruby
resource "aws_subnet" "PublicS1" { # Creating Public Subnets
  vpc_id                  = aws_vpc.Semi1_VPC.id
  map_public_ip_on_launch = "true"
  availability_zone       = "us-east-1a"
  cidr_block              = var.public1 # CIDR block of public subnets
}
#Create a Private Subnet                   # Creating PriPracticasIvate Subnets
resource "aws_subnet" "PrivateS1" {
  vpc_id            = aws_vpc.Semi1_VPC.id
  cidr_block        = var.private1 # CIDR block of private subnets
  availability_zone = "us-east-1a"
}
#Create a Public Subnets.
resource "aws_subnet" "PublicS2" { # Creating Public Subnets
  vpc_id                  = aws_vpc.Semi1_VPC.id
  map_public_ip_on_launch = "true"
  availability_zone       = "us-east-1b"
  cidr_block              = var.public2 # CIDR block of public subnets
}
#Create a Private Subnet                   # Creating Private Subnets
resource "aws_subnet" "PrivateS2" {
  vpc_id            = aws_vpc.Semi1_VPC.id
  cidr_block        = var.private2 # CIDR block of private subnets
  availability_zone = "us-east-1b"
}
```

## ROUTING TABLES AND ROUTE TABLE ASSOCIATIONS

```ruby
#Route table for Public Subnet's
resource "aws_route_table" "PublicRT" { # Creating RT for Public Subnet
  vpc_id = aws_vpc.Semi1_VPC.id
  route {
    cidr_block = "0.0.0.0/0" # Traffic from Public Subnet reaches Internet via Internet Gateway
    gateway_id = aws_internet_gateway.IGW.id
  }
}
#Route table for Private Subnet's
resource "aws_route_table" "PrivateRT" { # Creating RT for Private Subnet
  vpc_id = aws_vpc.Semi1_VPC.id
  route {
    cidr_block     = "0.0.0.0/0" # Traffic from Private Subnet reaches Internet via NAT Gateway
    nat_gateway_id = aws_nat_gateway.NATgw.id
  }
}
#Route table Association with Public Subnet's
resource "aws_route_table_association" "PublicRTassociation" {
  subnet_id      = aws_subnet.PublicS1.id
  route_table_id = aws_route_table.PublicRT.id
}
#Route table Association with Private Subnet's
resource "aws_route_table_association" "PrivateRTassociation" {
  subnet_id      = aws_subnet.PrivateS1.id
  route_table_id = aws_route_table.PrivateRT.id
}

#Route table Association with Public Subnet's
resource "aws_route_table_association" "PublicRTassociation2" {
  subnet_id      = aws_subnet.PublicS2.id
  route_table_id = aws_route_table.PublicRT.id
}
#Route table Association with Private Subnet's
resource "aws_route_table_association" "PrivateRTassociation2" {
  subnet_id      = aws_subnet.PrivateS2.id
  route_table_id = aws_route_table.PrivateRT.id
}
```

## Elastic IP

```ruby
resource "aws_eip" "nateIP" {
  vpc = true
}
```

## NAT GATEWAY

```ruby
#Creating the NAT Gateway using subnet_id and allocation_id
resource "aws_nat_gateway" "NATgw" {
  allocation_id = aws_eip.nateIP.id
  subnet_id     = aws_subnet.PrivateS1.id
}
```

## SUBNET GROUP

```ruby
resource "aws_db_subnet_group" "mysql-subnet-group" {
  name       = "mysql-subnet-group"
  subnet_ids = ["${aws_subnet.PrivateS1.id}", "${aws_subnet.PrivateS2.id}"]
}
```

## RDS INSTANCE

```ruby
resource "aws_db_instance" "mysql-instance" {
  allocated_storage       = 100
  engine                  = "mysql"
  engine_version          = "8.0.28"
  instance_class          = "db.t3.micro"
  identifier              = "mysql"
  db_name                 = var.DATABASE_NAME
  username                = var.DATABASE_USER
  password                = var.DATABASE_PASSWORD
  db_subnet_group_name    = aws_db_subnet_group.mysql-subnet-group.name
  multi_az                = "false"
  vpc_security_group_ids  = ["${aws_security_group.MySql-sg.id}"]
  storage_type            = "gp2"
  backup_retention_period = 30
  availability_zone       = aws_subnet.PrivateS1.availability_zone
  skip_final_snapshot     = true
}
```

## RDS SECURITY GROUP

```ruby
resource "aws_security_group" "MySql-sg" {
  vpc_id = aws_vpc.Semi1_VPC.id
  name   = "MySql-sg"
  egress = [
    {
      cidr_blocks      = ["0.0.0.0/0", ]
      description      = ""
      from_port        = 0
      ipv6_cidr_blocks = []
      prefix_list_ids  = []
      protocol         = "-1"
      security_groups  = []
      self             = false
      to_port          = 0
    }
  ]
  ingress = [
    {
      cidr_blocks      = ["0.0.0.0/0",]
      description      = ""
      from_port        = 3306
      to_port          = 3306
      protocol         = "tcp"
      ipv6_cidr_blocks = []
      prefix_list_ids  = []
      self             = false
      security_groups  = ["${aws_security_group.Semi1-sg.id}"]
    }
  ]
}
```

## KEY PAIR

```ruby
resource "aws_key_pair" "Semi1-key" {
  key_name   = "Semi1"
  public_key = file("${var.PATH_PUBLIC_KEYPAIR}")
}
```

## EC2

### INSTANCIA DE NODEJS

```ruby
resource "aws_instance" "ec2_node" {
  ami                    = "ami-053b0d53c279acc90"
  instance_type          = "t2.micro"
  key_name               = aws_key_pair.Semi1-key.key_name
  vpc_security_group_ids = [aws_security_group.Semi1-sg.id]
  subnet_id              = aws_subnet.PublicS1.id
  depends_on = [
    aws_db_instance.mysql-instance
  ]
}
```

### INSTANCIA DE PYTHON

```ruby
resource "aws_instance" "ec2_python" {
  ami                    = "ami-053b0d53c279acc90"
  instance_type          = "t2.micro"
  key_name               = aws_key_pair.Semi1-key.key_name
  vpc_security_group_ids = [aws_security_group.Semi1-sg.id]
  subnet_id              = aws_subnet.PublicS2.id
  depends_on = [
    aws_db_instance.mysql-instance
  ]
}
```

## SECURITY GROUP EC2

```ruby
resource "aws_security_group" "Semi1-instances-sg" {
  vpc_id = aws_vpc.Semi1_VPC.id
  name   = "Semi1_instances-sg"
  egress = [
    {
      cidr_blocks      = ["0.0.0.0/0", ]
      description      = ""
      from_port        = 0
      ipv6_cidr_blocks = []
      prefix_list_ids  = []
      protocol         = "-1"
      security_groups  = [aws_security_group.Semi1-sg.id]
      self             = false
      to_port          = 0
    }
  ]
  ingress = [
    {
      cidr_blocks      = ["0.0.0.0/0", ]
      description      = ""
      from_port        = 22
      ipv6_cidr_blocks = []
      prefix_list_ids  = []
      protocol         = "tcp"
      security_groups  = [aws_security_group.Semi1-sg.id]
      self             = false
      to_port          = 22
    },
    {
      cidr_blocks      = ["0.0.0.0/0", ]
      description      = ""
      from_port        = 3306
      ipv6_cidr_blocks = []
      prefix_list_ids  = []
      protocol         = "tcp"
      security_groups  = [aws_security_group.Semi1-sg.id]
      self             = false
      to_port          = 3306
    },
    {
      cidr_blocks      = ["0.0.0.0/0", ]
      description      = ""
      from_port        = 3000
      ipv6_cidr_blocks = []
      prefix_list_ids  = []
      protocol         = "tcp"
      security_groups  = [aws_security_group.Semi1-sg.id]
      self             = false
      to_port          = 3000
    },
    {
      cidr_blocks      = ["0.0.0.0/0", ]
      description      = ""
      from_port        = 80
      ipv6_cidr_blocks = []
      prefix_list_ids  = []
      protocol         = "tcp"
      security_groups  = [aws_security_group.Semi1-sg.id]
      self             = false
      to_port          = 80
    }
  ]
}
```

## S3 BUCKET

![Captura de pantalla 2023-10-05 213359.png](Manual%20Te%CC%81cnico%20896c602379284fcb99329fcb24dd0a57/Captura_de_pantalla_2023-10-05_213359.png)

# 📄 Conclusiones

● **Eficiencia y Consistencia:** La IaC ofrece una manera eficiente y consistente de
gestionar y desplegar infraestructuras. Permite la automatización de tareas
repetitivas, lo que reduce errores humanos y asegura que las configuraciones sean
coherentes en diferentes entornos.

● **Agilidad y Escalabilidad:** La IaC facilita la rápida creación y destrucción de
entornos de desarrollo, pruebas y producción. Esto permite una mayor agilidad en el
ciclo de desarrollo y un escalado eficiente de recursos según las necesidades.

● **Versionamiento y Control de Cambios:** Al utilizar IaC, es posible versionar y
controlar los cambios en la infraestructura de manera similar al control de versiones
de software. Esto mejora la colaboración, la trazabilidad y la capacidad de revertir
cambios problemáticos.

● **Documentación Automática:** La IaC genera documentación actualizada
automáticamente sobre la infraestructura y su configuración. Esto es valioso para el
entendimiento, la auditoría y el cumplimiento de regulaciones.

● **Reducción de Riesgos:** La IaC minimiza los riesgos al eliminar las configuraciones
manuales propensas a errores. La automatización y la replicabilidad mejoran la
estabilidad y la seguridad de los sistemas.