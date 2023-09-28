import mysql.connector
from flask import Flask, request, jsonify
from dotenv import dotenv_values
import boto3
import os
import mimetypes
import time
from util import check_password, hash_password, compare_password

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
        query = 'SELECT id, contrasenia FROM USUARIO WHERE correo = %s'
        cursor.execute(query, (correo,))
        result = cursor.fetchone()

        if result is None:
            return jsonify({'success': False, 'mensaje': 'Credenciales incorrectas'}), 401

        # Obtén la contraseña almacenada en la base de datos
        contrasenia_bd = result[1]
        contrasenia = hash_password(contrasenia)
        # Comparar contraseñas
        if contrasenia == contrasenia_bd:
            return jsonify({'success': True, 'mensaje': 'Bienvenido', 'extra': result[0]}), 200
        else:
            return jsonify({'success': False, 'mensaje': 'Credenciales incorrectas'}), 401

    except Exception as e:
        print("Error:", e)
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error al procesar la solicitud'}), 500

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

#AQUI HACIA ABAJO FALTA S3

@app.route('/albumes/<int:id_album>', methods=['PUT'])
def update_album(id_album):
    try:
        # Obtén los datos del cuerpo de la solicitud
        data = request.json
        nombre = data.get('nombre')
        descripcion = data.get('descripcion')
        id_artista = data.get('id_artista')
        imagen_portada = data.get('imagen_portada')
        query = 'UPDATE ALBUM SET nombre = %s, descripcion = %s, id_artista = %s, imagen_portada = %s WHERE id = %s'
        values = (nombre, descripcion, id_artista, imagen_portada, id_album)
        cursor.execute(query, values)
        db.commit()

        return jsonify({'success': True, 'mensaje': 'Álbum actualizado correctamente'}), 200

    except Exception as e:
        print("Error:", e)
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error al actualizar el álbum'}), 500

@app.route('/albumes/<int:id_album>', methods=['DELETE'])
def delete_album(id_album):
    try:
        # Consulta para obtener la URL de la imagen del álbum
        query_select_imagen = 'SELECT imagen_portada FROM ALBUM WHERE id = %s'
        cursor.execute(query_select_imagen, (id_album,))
        result = cursor.fetchone()

        if result is None:
            return jsonify({'success': False, 'mensaje': 'Álbum no encontrado'}), 404

        url_imagen = result[0]

        # Eliminar la imagen (Simulación, ya que en este ejemplo no se utiliza S3)
        # deleteFiletoS3(url_imagen, (err, data) => {
        #     if err:
        #         print('Error al eliminar la imagen:', err)
        #         return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error al eliminar la imagen'}), 500
        #     else:
        # Consulta para eliminar el álbum
        query = 'DELETE FROM ALBUM WHERE id = %s'
        cursor.execute(query, (id_album,))
        db.commit()

        return jsonify({'success': True, 'mensaje': 'Álbum eliminado correctamente'}), 200

    except Exception as e:
        print("Error:", e)
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error al eliminar el álbum'}), 500

@app.route('/canciones', methods=['POST'])
def create_song():
    try:
        # Obtén los datos del cuerpo de la solicitud
        nombre = request.json['nombre']
        duracion = request.json['duracion']
        id_artista = request.json['id_artista']
        id_album = request.json['id_album']

        # Subir la imagen a S3 (Simulación, ya que en este ejemplo no se utiliza S3)
        url_imagen = request.json['fotografia']  # Reemplazar por la URL real después de la subida

        # Subir el audio a S3 (Simulación, ya que en este ejemplo no se utiliza S3)
        url_audio = request.json['archivo_mp3']  # Reemplazar por la URL real después de la subida

        # Consulta para insertar una nueva canción
        query = 'INSERT INTO CANCION (nombre, fotografia, duracion, archivo_mp3, id_artista, id_album) VALUES (%s, %s, %s, %s, %s, %s)'
        values = (nombre, url_imagen, duracion, url_audio, id_artista, id_album)
        cursor.execute(query, values)
        db.commit()

        return jsonify({'success': True, 'mensaje': 'Canción creada correctamente'}), 200

    except Exception as e:
        print("Error:", e)
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error al insertar la canción'}), 500

@app.route('/canciones', methods=['GET'])
def get_songs():
    try:
        # Consulta para obtener todas las canciones con información del artista
        
        query = """SELECT c.id AS id_cancion, c.nombre AS nombre_cancion, c.duracion, a.id AS id_artista, a.nombre AS nombre_artista,
                    CONCAT('https://{}/', c.fotografia) AS url_imagen,
                    CONCAT('https://{}/', c.archivo_mp3) AS url_audio
                    FROM CANCION c
                    INNER JOIN ARTISTA a ON a.id = c.id_artista""".format(app.config['AWS_BUCKET_NAME'])

        cursor.execute(query)
        result = cursor.fetchall()

        # Convertir el resultado a un formato JSON
        songs = []
        for song in result:
            song_data = {
                'id_cancion': song[0],
                'nombre_cancion': song[1],
                'duracion': song[2],
                'id_artista': song[3],
                'nombre_artista': song[4],
                'url_imagen': song[5],
                'url_audio': song[6]
            }
            songs.append(song_data)

        return jsonify({'success': True, 'canciones': songs}), 200

    except Exception as e:
        print("Error:", e)
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error al obtener las canciones'}), 500

if __name__ == '__main__':
    app.run(debug=True)
