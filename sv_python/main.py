import mysql.connector
from flask import Flask, request, jsonify
from dotenv import dotenv_values
import boto3
import os
import mimetypes
import time
from util import check_password, hash_password, compare_password
from datetime import datetime

app = Flask(__name__)

settings = dotenv_values()

db_config = {
    'host': settings['DB_HOST'],
    'user': settings['DB_USER'],
    'password': settings['DB_PASSWORD'],
    'database': settings['DB_DATABASE'],
    'port': settings['DB_PORT']
}

# Dependecias para aws s3 aws-sdk/client-s3
s3 = boto3.client(
    's3',
    region_name=os.environ.get('AWS_REGION'),
    aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
    use_ssl=False,
    config=boto3.session.Config(signature_version='s3v4')
)

def upload_file_to_s3(file, folder_name):
    try:
        key = f"{folder_name}/{int(time.time())}_{file.filename}"
        content_type = mimetypes.guess_type(key)[0] or 'application/octet-stream'

        s3.upload_fileobj(
            file,
            os.environ.get('AWS_BUCKET_NAME'),
            key,
            ExtraArgs={'ContentType': content_type}
        )

        return key  # Devuelve la clave del archivo en S3
    except Exception as e:
        return str(e)

def delete_file_from_s3(key):
    try:
        s3.delete_object(
            Bucket=os.environ.get('AWS_BUCKET_NAME'),
            Key=key
        )

        return "Archivo eliminado exitosamente"
    except Exception as e:
        return str(e)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'jpg', 'jpeg', 'png', 'gif'}


db = mysql.connector.connect(**db_config)
cursor = db.cursor()

@app.route('/', methods=['GET'])
def hello():
    return "Hola, ¡esta es tu API en Python!"

@app.route('/usuarios/register', methods=['POST'])
def register_user():
    try:
        # Se recibe los parámetros que posee esta entidad
        parametro = request.form.to_dict()
        print("Parametro")
        print(parametro)
        # Debido a que la encriptación devuelve una promesa, es necesario realizarlo de la siguiente forma
        hashed_password = hash_password(parametro['contrasenia'])
    
        if hashed_password:
            parametro['contrasenia'] = hashed_password

            file = request.files['archivo']

            if file and allowed_file(file.filename):
                folder_name = os.environ.get('AWS_BUCKET_FOLDER_FOTOS')
                foto_key = upload_file_to_s3(file, folder_name)

                if foto_key:
                    parametro['foto'] = foto_key
                    parametro['es_administrador'] = parametro['es_administrador'].lower() == 'true'
                    
                    query = 'INSERT INTO USUARIO (correo, contrasenia, nombres, apellidos, foto, fecha_nacimiento, es_administrador) VALUES (%s, %s, %s, %s, %s, %s, %s)'
                    # Ejecuta la consulta de inserción en tu base de datos aquí
                            #(parametro['correo'], parametro['contrasenia'], parametro['nombres'], parametro['apellidos'], parametro['foto'], parametro['fecha_nacimiento'], parametro['es_administrador'])
                    values = (parametro['correo'], parametro['contrasenia'], parametro['nombres'], parametro['apellidos'], parametro['foto'], parametro['fecha_nacimiento'], parametro['es_administrador'])
                    
                    # Recorrer values para verificar que no existan valores vacios
                    for value in values:
                        print(value)

                    cursor.execute(query, values)
                    db.commit()

                    # Devuelve la respuesta adecuada
                    return jsonify({"success": True, "mensaje": "Usuario creado correctamente"})
                else:
                    return jsonify({"success": False, "mensaje": "Error al subir el archivo a S3"}), 500
            else:
                return jsonify({"success": False, "mensaje": "Formato de archivo no permitido"}), 400
        else:
            return jsonify({"success": False, "mensaje": "Ha ocurrido un error al encriptar la contraseña"}), 500
    except Exception as e:
        return jsonify({"success": False, "mensaje": str(e)}), 500

@app.route('/usuarios/login', methods=['POST'])
def login_user():
    try:
        # Se recibe los parametros
        correo = request.json.get('correo')
        contrasenia = request.json.get('contrasenia')

        # Se define el query que obtendra la contrasenia encriptada
        query = 'SELECT id, contrasenia, es_administrador FROM USUARIO WHERE correo = %s'
        cursor.execute(query, (correo,))
        result = cursor.fetchone()

        if result is None:
            return jsonify({'success': False, 'mensaje': 'Credenciales incorrectas'}), 401

        # Obtén la contraseña almacenada en la base de datos
        contrasenia_bd = result[1]
        #contrasenia = hash_password(contrasenia)
        print(contrasenia)
        print(contrasenia_bd)
        print(result)
        # Comparar contraseñas

        # Result format
        """         {
            "success": true,
            "mensaje": "Bienvenido",
            "extra": {
                "id_usuario": 5,
                "es_administrador": 0
            }
        } """

        extra = { 'id_usuario': result[0], 'es_administrador': result[2] }
        if compare_password(contrasenia, contrasenia_bd):
            return jsonify({'success': True, 'mensaje': 'Bienvenido', 'extra': extra}), 200
        else:
            return jsonify({'success': False, 'mensaje': 'Credenciales incorrectas'}), 401

    except Exception as e:
        print("Error:", e)
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error al procesar la solicitud'}), 500

# Ruta para obtener un usuario por su ID
@app.route('/usuario/<int:id>', methods=['GET'])
def obtener_usuario(id):
    try:
        query = "SELECT nombres, apellidos, foto, correo, fecha_nacimiento FROM USUARIO WHERE id = %s"
        cursor.execute(query, (id,))
        result = cursor.fetchone()

        """
        fecha_nacimiento en formato de base de datos: "2023-01-01T06:00:00.000Z"
        """
        fecha = result[4].strftime("%Y-%m-%dT%H:%M:%S.000Z")

 
        if result:
            usuario = {
                'nombres': result[0],
                'apellidos': result[1],
                'foto': result[2],
                'correo': result[3],
                'fecha_nacimiento': fecha
            }
            return jsonify({'success': True, 'usuario': usuario})
        else:
            return jsonify({'success': False, 'mensaje': 'Usuario no encontrado'})
    except Exception as e:
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error al obtener el usuario', 'error': str(e)})

# Actualizar un usuario por su ID 
@app.route('/usuarios/<int:id_usuario>/<contrasenia>', methods=['PUT'])
def update_user(id_usuario, contrasenia):
    try:
        # Se obtienen los parámetros a utilizar para actualizar los datos de un usuario
        nombres = request.form['nombres']
        apellidos = request.form['apellidos']
        correo = request.form['correo']

        query_select = 'SELECT foto, contrasenia FROM USUARIO WHERE id = %s'
        cursor.execute(query_select, (id_usuario,))
        result = cursor.fetchone()

        if result:
            _, stored_password = result

            if compare_password(contrasenia, stored_password):
                # Elimina la imagen de S3
                delete_file_from_s3(result[0])

                # Sube el nuevo archivo a S3
                url_imagen = upload_file_to_s3(request.files['archivo'], os.environ.get('AWS_BUCKET_FOLDER_FOTOS'))

                if url_imagen:
                    query = 'UPDATE USUARIO SET nombres = %s, apellidos = %s, foto = %s, correo = %s WHERE id = %s;'
                    cursor.execute(query, (nombres, apellidos, url_imagen, correo, id_usuario))
                    db.commit()
                    return jsonify({"success": True, "mensaje": "Usuario actualizado correctamente"})

                return jsonify({"success": False, "mensaje": "Ha ocurrido un error al subir el archivo"}), 500

            return jsonify({"success": False, "mensaje": "Contraseña incorrecta"}), 400

        return jsonify({"success": False, "mensaje": "Ha ocurrido un error al obtener al usuario"}), 500

    except Exception as e:
        return jsonify({"success": False, "mensaje": str(e)}), 500

@app.route('/artistas', methods=['POST'])
def create_artist():
    try:
        # Obtén los datos del cuerpo de la solicitud
        data = request.json
        nombre = data.get('nombre')
        fecha_nacimiento = data.get('fecha_nacimiento')
        fotografiaURL = data.get('fotografia')
        file = data.get('fotografia')
        if file and allowed_file(file.filename):
            folder_name = os.environ.get('AWS_BUCKET_FOLDER_FOTOS')
            foto_key = upload_file_to_s3(file, folder_name)
            if foto_key:
                fotografiaURL = foto_key
                query = 'INSERT INTO ARTISTA (nombre, fotografia, fecha_nacimiento) VALUES (%s, %s, %s)'
                values = (nombre, fotografiaURL, fecha_nacimiento)
                cursor.execute(query, values)
                db.commit()
                return jsonify({"success": True, "mensaje": "Usuario creado correctamente"})
            else:
                return jsonify({"success": False, "mensaje": "Error al subir el archivo a S3"}), 500
        return jsonify({'success': True, 'mensaje': 'Artista creado correctamente'}), 200

    except Exception as e:
        print("Error:", e)
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error al insertar el artista'}), 500

"""
Verificacion de un usuario administrador por medio de su contrasenia para que asi se pueda realizar alguna transaccion segun sea el caso
"""
@app.route('/usuarios/password', methods=['POST'])
def verificar_contrasenia():
    # Se recibe el parámetro contrasenia
    contrasenia = request.json.get('contrasenia')

    # Consulta SQL para obtener las contraseñas de los usuarios administradores
    query = "SELECT id, contrasenia FROM USUARIO WHERE es_administrador = TRUE"

    try:
        cursor.execute(query)
        result = cursor.fetchall()

        comparaciones = []
        for row in result:
            user_id, hashed_password = row
            comparaciones.append(compare_password(contrasenia, hashed_password))

        es_valido = any(comparaciones)

        if es_valido:
            return jsonify({"success": True, "mensaje": "La contraseña es válida para realizar la transacción"})
        else:
            return jsonify({"success": False, "mensaje": "La contraseña no es válida para realizar la transacción"})

    except Exception as e:
        print('Error al validar la contraseña:', str(e))
        return jsonify({"success": False, "mensaje": "Ha ocurrido un error al validar la contraseña"})

# Crear un nuevo artista
@app.route('/artistas', methods=['GET'])
def get_artists():
    try:
        # Consulta para obtener todos los artistas
        query = 'SELECT * FROM ARTISTA'
        cursor.execute(query)
        result = cursor.fetchall()

        return jsonify({'success': True, 'artistas': result}), 200

    except Exception as e:
        print("Error:", e)
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error al obtener los artistas'}), 500
    
@app.route('/artistas/<int:id_artista>', methods=['PUT'])
def update_artist(id_artista):
    try:
        # Obtén los datos del cuerpo de la solicitud
        data = request.json
        nombre = data.get('nombre')
        fotografia = data.get('fotografia')
        fecha_nacimiento = data.get('fecha_nacimiento')

        # Consulta para actualizar un artista
 
        query_select = 'SELECT fotografia FROM ARTISTA WHERE id = %s'
        cursor.execute(query_select, (id_artista,))
        result = cursor.fetchone()

        if result:
            delete_file_from_s3(result[0])
            # Sube el nuevo archivo a S3
            url_imagen = upload_file_to_s3(fotografia, os.environ.get('AWS_BUCKET_FOLDER_FOTOS'))

            if url_imagen:
                query = 'UPDATE ARTISTA SET nombre = %s, fotografia = %s, fecha_nacimiento = %s WHERE id = %s'
                values = (nombre, fotografia, fecha_nacimiento, id_artista)
                cursor.execute(query, values)
                db.commit()
                return jsonify({"success": True, "mensaje": "Usuario actualizado correctamente"})

            return jsonify({"success": False, "mensaje": "Ha ocurrido un error al subir el archivo"}), 500

        return jsonify({"success": False, "mensaje": "Ha ocurrido un error al obtener al usuario"}), 500

    except Exception as e:
        print("Error:", e)
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error al actualizar el artista'}), 500

@app.route('/artistas/<int:id_artista>', methods=['DELETE'])
def delete_artist(id_artista):
    try:
        # Consulta para eliminar un artista por su ID
        query_select = 'SELECT fotografia FROM ARTISTA WHERE id = %s'
        cursor.execute(query_select, (id_artista,))
        result = cursor.fetchone()

        if result:
            delete_file_from_s3(result[0])
            query = 'DELETE FROM ARTISTA WHERE id = %s'
            cursor.execute(query, (id_artista,))
            db.commit()
            return jsonify({"success": True, "mensaje": "Usuario actualizado correctamente"})

        return jsonify({"success": False, "mensaje": "Ha ocurrido un error al obtener al usuario"}), 500

    except Exception as e:
        print("Error:", e)
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error al eliminar el artista'}), 500

@app.route('/albumes', methods=['POST'])
def create_album():
    try:
        # Obtén los datos del cuerpo de la solicitud
        data = request.json
        nombre = data.get('nombre')
        descripcion = data.get('descripcion')
        imagen_portada = data.get('imagen_portada')
        id_artista = data.get('id_artista')

        # Consulta para insertar un nuevo álbum
        query = 'INSERT INTO ALBUM (nombre, descripcion, imagen_portada, id_artista) VALUES (%s, %s, %s, %s)'
        values = (nombre, descripcion, imagen_portada, id_artista)
        cursor.execute(query, values)
        db.commit()

        return jsonify({'success': True, 'mensaje': 'Álbum creado correctamente'}), 200

    except Exception as e:
        print("Error:", e)
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error al insertar el álbum'}), 500

#AQUI HACIA ABAJO FALTA S3 DESDE ACA FALTA HACER TESTS
@app.route('/albumes/<int:id_album>', methods=['PUT'])
def actualizar_album(id_album):
    try:
        nombre = request.form['nombre']
        descripcion = request.form['descripcion']
        id_artista = request.form['id_artista']
        query_select_imagen = 'SELECT imagen_portada FROM ALBUM WHERE id = %s'

        cursor = db.cursor()
        cursor.execute(query_select_imagen, (id_album,))
        result = cursor.fetchone()

        if result is None:
            return jsonify({'success': False, 'mensaje': 'No se encontró el álbum'}), 404

        imagen_portada = result[0]

        # Elimina la imagen actual de S3
        delete_file_from_s3(imagen_portada)

        # Sube la nueva imagen a S3
        imagen_subida = upload_file_to_s3(request.files['archivo'], os.environ.get('AWS_BUCKET_FOLDER_FOTOS'))

        # Actualiza el álbum en la base de datos
        query = 'UPDATE ALBUM SET nombre = %s, descripcion = %s, imagen_portada = %s, id_artista = %s WHERE id = %s'
        cursor.execute(query, (nombre, descripcion, imagen_subida, id_artista, id_album))
        db.commit()
        cursor.close()

        return jsonify({'success': True, 'mensaje': 'Álbum actualizado correctamente'}), 200

    except Exception as e:
        print('Error:', str(e))
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error'}), 500

# Eliminar un album por su ID
@app.route('/albumes/<int:id_album>', methods=['DELETE'])
def eliminar_album(id_album):
    try:
        query_select_imagen = 'SELECT imagen_portada FROM ALBUM WHERE id = %s'

        cursor = db.cursor()
        cursor.execute(query_select_imagen, (id_album,))
        result = cursor.fetchone()

        if result is None:
            cursor.close()
            return jsonify({'success': False, 'mensaje': 'No se encontró el álbum'}), 404

        url_imagen = result[0]

        # Elimina la imagen de S3
        delete_file_from_s3(url_imagen)

        # Elimina el álbum de la base de datos
        query = 'DELETE FROM ALBUM WHERE id = %s'
        cursor.execute(query, (id_album,))
        db.commit()
        cursor.close()

        return jsonify({'success': True, 'mensaje': 'Álbum eliminado correctamente'}), 200

    except Exception as e:
        print('Error:', str(e))
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error'}), 500

# Crear una nueva cancion
@app.route('/canciones', methods=['POST'])
def crear_cancion():
    try:
        nombre = request.form['nombre']
        duracion = request.form['duracion']
        id_artista = request.form['id_artista']
        id_album = request.form['id_album']

        # Sube la imagen de portada a S3
        imagen_portada = request.files['imagen_portada']
        url_imagen = upload_file_to_s3(imagen_portada, os.environ.get('AWS_BUCKET_FOLDER_FOTOS'))

        # Sube el archivo de audio MP3 a S3
        archivo_mp3 = request.files['archivo_mp3']
        url_audio = upload_file_to_s3(archivo_mp3, os.environ.get('AWS_BUCKET_FOLDER_CANCIONES'))

        # Inserta la canción en la base de datos
        query = 'INSERT INTO CANCION (nombre, fotografia, duracion, archivo_mp3, id_artista, id_album) VALUES (%s, %s, %s, %s, %s, %s)'
        cursor = db.cursor()
        cursor.execute(query, (nombre, url_imagen, duracion, url_audio, id_artista, id_album))
        db.commit()
        cursor.close()

        return jsonify({'success': True, 'mensaje': 'Canción creada correctamente'}), 200

    except Exception as e:
        print('Error:', str(e))
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error'}), 500

# Obtener todas las canciones
@app.route('/canciones', methods=['GET'])
def obtener_canciones():
    try:
        query = """
        SELECT c.id AS id_cancion, c.nombre AS nombre_cancion, c.duracion, a.id AS id_artista, a.nombre AS nombre_artista,
        CONCAT('https://{}s3.amazonaws.com/', c.fotografia) AS url_imagen,
        CONCAT('https://{}s3.amazonaws.com/', c.archivo_mp3) AS url_audio
        FROM CANCION c
        INNER JOIN ARTISTA a ON a.id = c.id_artista
        """.format(os.environ.get('AWS_BUCKET_NAME'), os.environ.get('AWS_BUCKET_NAME'))

        cursor = db.cursor(dictionary=True)
        cursor.execute(query)
        result = cursor.fetchall()
        cursor.close()

        return jsonify({'success': True, 'canciones': result}), 200

    except Exception as e:
        print('Error:', str(e))
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error'}), 500

# Actualizar una cancion por su ID
@app.route('/canciones/<int:id_cancion>', methods=['PUT'])
def actualizar_cancion(id_cancion):
    try:
        nombre = request.form['nombre']
        duracion = request.form['duracion']
        id_artista = request.form['id_artista']
        id_album = request.form['id_album']

        # Obtener las URL de los archivos a modificar
        query_select = 'SELECT fotografia, archivo_mp3 FROM CANCION WHERE id = %s'
        cursor = db.cursor()
        cursor.execute(query_select, (id_cancion,))
        result = cursor.fetchone()

        if result is None:
            cursor.close()
            return jsonify({'success': False, 'mensaje': 'No se encontró la canción'}), 404

        url_fotografia = result[0]
        url_archivo_mp3 = result[1]

        # Elimina la imagen anterior de S3
        delete_file_from_s3(url_fotografia)

        # Elimina el archivo MP3 anterior de S3
        delete_file_from_s3(url_archivo_mp3)

        # Sube la nueva imagen de portada a S3
        imagen_portada = request.files['fotografia']
        url_nueva_fotografia = upload_file_to_s3(imagen_portada, os.environ.get('AWS_BUCKET_FOLDER_FOTOS'))

        # Sube el nuevo archivo MP3 a S3
        archivo_mp3 = request.files['archivo_mp3']
        url_nuevo_archivo_mp3 = upload_file_to_s3(archivo_mp3, os.environ.get('AWS_BUCKET_FOLDER_CANCIONES'))

        # Actualiza la canción en la base de datos
        query = 'UPDATE CANCION SET nombre = %s, fotografia = %s, duracion = %s, archivo_mp3 = %s, id_artista = %s, id_album = %s WHERE id = %s'
        cursor.execute(query, (nombre, url_nueva_fotografia, duracion, url_nuevo_archivo_mp3, id_artista, id_album, id_cancion))
        db.commit()
        cursor.close()

        return jsonify({'success': True, 'mensaje': 'Canción actualizada correctamente'}), 200

    except Exception as e:
        print('Error:', str(e))
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error'}), 500

# Eliminar cancion pu su ID
@app.route('/canciones/<int:id_cancion>', methods=['DELETE'])
def eliminar_cancion(id_cancion):
    try:
        # Obtener las URL de los archivos a eliminar
        query_select = 'SELECT fotografia, archivo_mp3 FROM CANCION WHERE id = %s'
        cursor = db.cursor()
        cursor.execute(query_select, (id_cancion,))
        result = cursor.fetchone()

        if result is None:
            cursor.close()
            return jsonify({'success': False, 'mensaje': 'No se encontró la canción'}), 404

        url_archivo_mp3 = result[1]
        url_fotografia = result[0]

        # Elimina el archivo MP3 de S3
        delete_file_from_s3(url_archivo_mp3)

        # Elimina la imagen de S3
        delete_file_from_s3(url_fotografia)

        # Elimina la canción de la base de datos
        query = 'DELETE FROM CANCION WHERE id = %s'
        cursor.execute(query, (id_cancion,))
        db.commit()
        cursor.close()

        return jsonify({'success': True, 'mensaje': 'Canción eliminada correctamente'}), 200

    except Exception as e:
        print('Error:', str(e))
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error'}), 500

# Obtener todas las canciones que pertenezcan al artista y que no esten agregadas a otro album
@app.route('/canciones-artista/<int:id_artista>', methods=['GET'])
def obtener_canciones_artista(id_artista):
    try:
        query = """
        SELECT c.id AS id_cancion, c.nombre AS nombre_cancion, CONCAT('https://{}s3.amazonaws.com/', c.fotografia) AS url_imagen_cancion, 
        c.duracion AS duracion_cancion, a.nombre AS nombre_artista
        FROM CANCION c
        INNER JOIN ARTISTA a ON a.id = c.id_artista
        WHERE c.id_artista = ? AND c.id_album IS NULL
        """.format(os.environ.get('AWS_BUCKET_NAME'))

        cursor = db.cursor(dictionary=True)
        cursor.execute(query, (id_artista,))
        result = cursor.fetchall()
        cursor.close()

        return jsonify({'success': True, 'canciones_artista': result}), 200

    except Exception as e:
        print('Error:', str(e))
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error'}), 500

# Obtener todas las canciones que pertenezca a un album 
@app.route('/canciones-album/<int:id_album>', methods=['GET'])
def obtener_canciones_album(id_album):
    try:
        query = """
        SELECT c.id AS id_cancion, c.nombre AS nombre_cancion, CONCAT('https://{}s3.amazonaws.com/', c.fotografia) AS url_imagen_cancion, 
        c.duracion AS duracion_cancion, a.nombre AS nombre_artista
        FROM CANCION c
        INNER JOIN ARTISTA a ON a.id = c.id_artista
        WHERE c.id_album = ?
        """.format(os.environ.get('AWS_BUCKET_NAME'))

        cursor = db.cursor(dictionary=True)
        cursor.execute(query, (id_album,))
        result = cursor.fetchall()
        cursor.close()

        return jsonify({'success': True, 'canciones_album': result}), 200

    except Exception as e:
        print('Error:', str(e))
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error'}), 500

# Agregar una cacnion de un album
@app.route('/canciones-album/<int:id_cancion>', methods=['PUT'])
def agregar_cancion_a_album(id_cancion):
    try:
        id_album = request.json['id_album']
        query = 'UPDATE CANCION SET id_album = ? WHERE id = ?'

        cursor = db.cursor()
        cursor.execute(query, (id_album, id_cancion))
        db.commit()
        cursor.close()

        return jsonify({'success': True, 'mensaje': 'Canción adjuntada correctamente'}), 200

    except Exception as e:
        print('Error:', str(e))
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error'}), 500

# Eliminar una cacnion de un album
@app.route('/canciones-album/<int:id_cancion>', methods=['DELETE'])
def eliminar_cancion_de_album(id_cancion):
    try:
        query = "UPDATE CANCION SET id_album = null WHERE id = ?"

        cursor = db.cursor()
        cursor.execute(query, (id_cancion,))
        db.commit()
        cursor.close()

        return jsonify({'success': True, 'mensaje': 'Canción eliminada del álbum correctamente'}), 200

    except Exception as e:
        print('Error:', str(e))
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error'}), 500

# Agregar una cancion a favoritos para un usuario
@app.route('/favoritos', methods=['POST'])
def agregar_cancion_a_favoritos():
    try:
        id_cancion = request.json['id_cancion']
        id_usuario = request.json['id_usuario']
        query = 'INSERT INTO FAVORITO (id_cancion, id_usuario) VALUES (?, ?)'

        cursor = db.cursor()
        cursor.execute(query, (id_cancion, id_usuario))
        db.commit()
        cursor.close()

        return jsonify({'success': True, 'mensaje': 'Canción agregada a favoritos correctamente'}), 200

    except Exception as e:
        print('Error:', str(e))
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error'}), 500

# Obtener todas la canciones favoritas de un usuario
@app.route('/favoritos/<int:id_usuario>', methods=['GET'])
def obtener_canciones_favoritas(id_usuario):
    try:
        query = """
        SELECT f.id AS id_favorito, c.id AS id_cancion, c.nombre AS nombre_cancion, CONCAT('https://{}s3.amazonaws.com/', c.fotografia) AS url_imagen_cancion,
        c.duracion AS duracion_cancion, a.nombre AS nombre_artista
        FROM FAVORITO f
        INNER JOIN CANCION c ON c.id = f.id_cancion
        INNER JOIN ARTISTA a ON a.id = c.id_artista
        WHERE f.id_usuario = ?
        """.format(os.environ.get('AWS_BUCKET_NAME'))

        cursor = db.cursor(dictionary=True)
        cursor.execute(query, (id_usuario,))
        result = cursor.fetchall()
        cursor.close()

        return jsonify({'success': True, 'canciones_favoritas': result}), 200

    except Exception as e:
        print('Error:', str(e))
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error'}), 500

# Eliminar una cancion de un album
@app.route('/favoritos/<int:id_favorito>', methods=['DELETE'])
def eliminar_cancion_de_favoritos(id_favorito):
    try:
        query = "DELETE FROM FAVORITO WHERE id = ?"

        cursor = db.cursor()
        cursor.execute(query, (id_favorito,))
        db.commit()
        cursor.close()

        return jsonify({'success': True, 'mensaje': 'Canción eliminada de favoritos correctamente'}), 200

    except Exception as e:
        print('Error:', str(e))
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error'}), 500

# El usuario puede realizar la busqueda de albumes, canciones o artistas por medio de la entrada de usuario
@app.route('/buscar/<string:entrada>', methods=['GET'])
def buscar_entrada(entrada):
    try:
        query_albumes = """
        SELECT a.id AS id_album, a.nombre AS nombre_album, a.descripcion, a2.id AS id_artista, a2.nombre AS nombre_artista,
        JSON_ARRAYAGG(JSON_OBJECT('id_cancion', c.id, 'nombre_cancion', c.nombre, 'duracion_cancion', c.duracion)) AS detalle_album
        FROM ALBUM a
        INNER JOIN ARTISTA a2 ON a2.id = a.id_artista
        INNER JOIN CANCION c ON c.id_album = a.id
        WHERE CONCAT(a.nombre, a.descripcion) LIKE %s
        GROUP BY a.id
        """

        cursor = db.cursor(dictionary=True)
        cursor.execute(query_albumes, (f'%{entrada}%',))
        albumes = cursor.fetchall()

        query_artistas = """
        SELECT c.id AS id_cancion, c.nombre, c.fotografia, c.duracion, c.archivo_mp3, a.id AS id_artista, a.nombre AS nombre_artista
        FROM CANCION c
        INNER JOIN ARTISTA a ON a.id = c.id_artista
        WHERE a.nombre LIKE %s
        """
        cursor.execute(query_artistas, (f'%{entrada}%',))
        canciones_artista = cursor.fetchall()

        query_canciones = """
        SELECT c.id AS id_cancion, c.nombre, c.fotografia, c.duracion, c.archivo_mp3, a.id AS id_artista, a.nombre AS nombre_artista
        FROM CANCION c
        INNER JOIN ARTISTA a ON a.id = c.id_artista
        WHERE c.nombre LIKE %s
        """
        cursor.execute(query_canciones, (f'%{entrada}%',))
        canciones = cursor.fetchall()

        cursor.close()

        return jsonify({'success': True, 'albumes': albumes, 'canciones_artista': canciones_artista, 'canciones': canciones}), 200

    except Exception as e:
        print('Error:', str(e))
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error'}), 500

# Crear una nueva playlist
@app.route('/playlists', methods=['POST'])
def crear_playlist():
    try:
        nombre = request.json['nombre']
        fondo_portada = request.json['fondo_portada']
        id_usuario = request.json['id_usuario']
        query = 'INSERT INTO PLAYLIST (nombre, fondo_portada, id_usuario) VALUES (?, ?, ?)'

        cursor = db.cursor()
        cursor.execute(query, (nombre, fondo_portada, id_usuario))
        db.commit()
        cursor.close()

        return jsonify({'success': True, 'mensaje': 'Playlist creada correctamente'}), 200

    except Exception as e:
        print('Error:', str(e))
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error'}), 500

# Actualizar una playlist por su ID
@app.route('/playlists/<int:id>', methods=['PUT'])
def actualizar_playlist(id):
    try:
        nombre = request.json['nombre']
        fondo_portada = request.json['fondo_portada']
        query = 'UPDATE PLAYLIST SET nombre = ?, fondo_portada = ? WHERE id = ?'

        cursor = db.cursor()
        cursor.execute(query, (nombre, fondo_portada, id))
        db.commit()
        cursor.close()

        return jsonify({'success': True, 'mensaje': 'Playlist actualizada correctamente'}), 200

    except Exception as e:
        print('Error:', str(e))
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error'}), 500

# Eliminar una playlist por su ID
@app.route('/playlists/<int:id>', methods=['DELETE'])
def eliminar_playlist(id):
    try:
        query = 'DELETE FROM PLAYLIST WHERE id = ?'

        cursor = db.cursor()
        cursor.execute(query, (id,))
        db.commit()
        cursor.close()

        return jsonify({'success': True, 'mensaje': 'Playlist eliminada correctamente'}), 200

    except Exception as e:
        print('Error:', str(e))
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error'}), 500

# Agregar una cancion a una playlist
@app.route('/playlist-canciones', methods=['POST'])
def agregar_cancion_a_playlist():
    try:
        id_playlist = request.json['id_playlist']
        id_cancion = request.json['id_cancion']
        query = 'INSERT INTO DETALLE_PLAYLIST (id_playlist, id_cancion) VALUES (?, ?)'

        cursor = db.cursor()
        cursor.execute(query, (id_playlist, id_cancion))
        db.commit()
        cursor.close()

        return jsonify({'success': True, 'mensaje': 'Canción agregada correctamente a la playlist'}), 200

    except Exception as e:
        print('Error:', str(e))
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error'}), 500

# Obtener el detalle de una playlist por su ID
@app.route('/playlist-canciones/<int:id>', methods=['GET'])
def obtener_detalle_de_playlist(id):
    try:
        query = """
        SELECT c.id, c.nombre, c.fotografia, c.archivo_mp3
        FROM PLAYLIST p
        INNER JOIN DETALLE_PLAYLIST dp ON dp.id_playlist = p.id
        INNER JOIN CANCION c ON c.id = dp.id_cancion
        WHERE p.id = ?
        """

        cursor = db.cursor(dictionary=True)
        cursor.execute(query, (id,))
        result = cursor.fetchall()
        cursor.close()

        if result:
            return jsonify({'success': True, 'playlist': result}), 200
        else:
            return jsonify({'success': False, 'mensaje': 'Playlist no encontrada'}), 404

    except Exception as e:
        print('Error:', str(e))
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error'}), 500

# Eliminar una cancion de una playlist por su ID
@app.route('/playlist-canciones/<int:id_cancion>', methods=['DELETE'])
def eliminar_cancion_de_playlist(id_cancion):
    try:
        query = 'DELETE FROM DETALLE_PLAYLIST WHERE id = ?'

        cursor = db.cursor()
        cursor.execute(query, (id_cancion,))
        db.commit()
        cursor.close()

        return jsonify({'success': True, 'mensaje': 'Canción eliminada de la playlist correctamente'}), 200

    except Exception as e:
        print('Error:', str(e))
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error'}), 500

# Agrega una cancion al historial del usuario
@app.route('/historicos', methods=['POST'])
def agregar_cancion_a_historial():
    try:
        id_usuario = request.json['id_usuario']
        id_cancion = request.json['id_cancion']
        query = 'INSERT INTO HISTORICO (id_usuario, id_cancion) VALUES (?, ?)'

        cursor = db.cursor()
        cursor.execute(query, (id_usuario, id_cancion))
        db.commit()
        cursor.close()

        return jsonify({'success': True, 'mensaje': 'Historial agregado correctamente'}), 200

    except Exception as e:
        print('Error:', str(e))
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error'}), 500

# Top 5 caciones mar reproducidas
@app.route('/top5-canciones', methods=['GET'])
def obtener_top5_canciones():
    try:
        query = """
        SELECT c.id AS id_cancion, c.nombre AS nombre_cancion, c.fotografia, c.duracion, a.id AS id_artista, a.nombre AS nombre_artista, COUNT(h.id) AS cantidad
        FROM HISTORICO h
        INNER JOIN CANCION c ON c.id = h.id_cancion
        INNER JOIN ARTISTA a ON a.id = c.id_artista
        GROUP BY c.id
        ORDER BY cantidad DESC
        LIMIT 5
        """

        cursor = db.cursor(dictionary=True)
        cursor.execute(query)
        result = cursor.fetchall()
        cursor.close()

        return jsonify({'success': True, 'data': result}), 200

    except Exception as e:
        print('Error:', str(e))
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error'}), 500

# Obtiene el top 3 de artistas más escuchados.
@app.route('/top3-artistas', methods=['GET'])
def top3_artistas():
    cursor = db.cursor()
    query = """
        SELECT a.id AS id_artista, a.nombre AS nombre_artista, COUNT(h.id) AS cantidad
        FROM HISTORICO h
        INNER JOIN CANCION c ON c.id = h.id_cancion
        INNER JOIN ARTISTA a ON a.id = c.id_artista
        GROUP BY a.id
        ORDER BY cantidad DESC
        LIMIT 3
    """
    cursor.execute(query)
    result = cursor.fetchall()
    if result:
        return jsonify({'success': True, 'data': result})
    else:
        return jsonify({'success': False, 'mensaje': "Ha ocurrido un error al obtener los datos"})

# Obtiene el top 5 de álbumes más reproducidos.
@app.route('/top5-albumes', methods=['GET'])
def top5_albumes():
    cursor = db.cursor()
    query = """
        SELECT a.id AS id_album, a.nombre AS nombre_album, a.imagen_portada, COUNT(h.id) AS cantidad
        FROM HISTORICO h
        INNER JOIN CANCION c ON c.id = h.id_cancion
        INNER JOIN ALBUM a ON a.id = c.id_album
        GROUP BY a.id
        ORDER BY cantidad DESC
        LIMIT 5
    """
    cursor.execute(query)
    result = cursor.fetchall()
    if result:
        return jsonify({'success': True, 'data': result})
    else:
        return jsonify({'success': False, 'mensaje': "Ha ocurrido un error al obtener los datos"})

# Obtiene el historial de canciones reproducidas.
@app.route('/historial', methods=['GET'])
def historial():
    cursor = db.cursor()
    query = """
        SELECT c.id AS id_cancion, c.nombre, c.fotografia, c.duracion, h.fecha_registro
        FROM HISTORICO h
        INNER JOIN CANCION c ON c.id = h.id_cancion
    """
    cursor.execute(query)
    result = cursor.fetchall()
    if result:
        return jsonify({'success': True, 'data': result})
    else:
        return jsonify({'success': False, 'mensaje': "Ha ocurrido un error al obtener los datos"})

if __name__ == '__main__':
    app.run(debug=True)
