import mysql.connector
from flask import Flask, request, jsonify

app = Flask(__name__)

db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '123',
    'database': 'semi1_p1',
    'port': 3306
}

db = mysql.connector.connect(**db_config)
cursor = db.cursor()

@app.route('/', methods=['GET'])
def hello():
    return "Hola, ¡esta es tu API en Python!"

@app.route('/usuarios/register', methods=['POST'])
def register_user():
    try:
        parametro = request.json
        query = 'INSERT INTO USUARIO (correo, contrasenia, nombres, apellidos, foto, fecha_nacimiento, es_administrador) VALUES (%s, %s, %s, %s, %s, %s, %s)'
        values = (parametro['correo'], parametro['contrasenia'], parametro['nombres'], parametro['apellidos'], parametro['foto'], parametro['fecha_nacimiento'], parametro['es_administrador'])
        cursor.execute(query, values)
        db.commit()

        return jsonify({'success': True, 'mensaje': 'Usuario creado correctamente', 'id_insertado': cursor.lastrowid}), 200

    except Exception as e:
        print("Error:", e)
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error al insertar el usuario'}), 500
    
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
        # Obtén otros datos del cuerpo de la solicitud
        data = request.json
        nombres = data.get('nombres')
        apellidos = data.get('apellidos')
        foto = data.get('foto')
        correo = data.get('correo')

        # Se define el query que obtendrá la contraseña encriptada
        query_contrasenia = 'SELECT contrasenia FROM USUARIO WHERE id = %s'

        # Se ejecuta el query y se realiza la comparación de contrasenia para realizar la actualización del usuario
        cursor.execute(query_contrasenia, (id_usuario,))
        result = cursor.fetchone()

        if result is None:
            return jsonify({'success': False, 'mensaje': 'Credencial incorrecta'}), 401

        # Obtén la contraseña almacenada en la base de datos
        contrasenia_bd = result[0]
        # Comparar contraseñas
        if contrasenia == contrasenia_bd:
            # Realizar la actualización del usuario
            query = 'UPDATE USUARIO SET nombres = %s, apellidos = %s, foto = %s, correo = %s WHERE id = %s;'
            cursor.execute(query, (nombres, apellidos, foto, correo, id_usuario))
            db.commit()

            return jsonify({'success': True, 'mensaje': 'Usuario actualizado correctamente'}), 200
        else:
            return jsonify({'success': False, 'mensaje': 'Credencial incorrecta'}), 401

    except Exception as e:
        print("Error:", e)
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error al actualizar el usuario'}), 500

@app.route('/artistas', methods=['POST'])
def create_artist():
    try:
        # Obtén los datos del cuerpo de la solicitud
        data = request.json
        nombre = data.get('nombre')
        fecha_nacimiento = data.get('fecha_nacimiento')
        fotografiaURL = data.get('fotografia')
        # Consulta para insertar un nuevo artista
        query = 'INSERT INTO ARTISTA (nombre, fotografia, fecha_nacimiento) VALUES (%s, %s, %s)'
        values = (nombre, fotografiaURL, fecha_nacimiento)
        print(query)
        print(values)
        cursor.execute(query, values)
        db.commit()

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
        query = 'UPDATE ARTISTA SET nombre = %s, fotografia = %s, fecha_nacimiento = %s WHERE id = %s'
        values = (nombre, fotografia, fecha_nacimiento, id_artista)
        cursor.execute(query, values)
        db.commit()

        return jsonify({'success': True, 'mensaje': 'Artista actualizado correctamente'}), 200

    except Exception as e:
        print("Error:", e)
        return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error al actualizar el artista'}), 500

@app.route('/artistas/<int:id_artista>', methods=['DELETE'])
def delete_artist(id_artista):
    try:
        # Consulta para eliminar un artista por su ID
        query = 'DELETE FROM ARTISTA WHERE id = %s'
        cursor.execute(query, (id_artista,))
        db.commit()

        return jsonify({'success': True, 'mensaje': 'Artista eliminado correctamente'}), 200

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

@app.route('/albumes/<int:id_album>', methods=['PUT'])
def update_album(id_album):
    try:
        # Obtén los datos del cuerpo de la solicitud
        data = request.json
        nombre = data.get('nombre')
        descripcion = data.get('descripcion')
        id_artista = data.get('id_artista')
        imagen_portada = data.get('imagen_portada')
        # Consulta para obtener la URL de la imagen actual del álbum
        #query_select_imagen = 'SELECT imagen_portada FROM ALBUM WHERE id = %s'
        #cursor.execute(query_select_imagen, (id_album,))
        #result = cursor.fetchone()

        #if result is None:
        #    return jsonify({'success': False, 'mensaje': 'Álbum no encontrado'}), 404

        #url_imagen_actual = result[0]

        # Eliminar la imagen actual (Simulación, ya que en este ejemplo no se utiliza S3)
        # deleteFiletoS3(url_imagen_actual, (err, data) => {
        #     if err:
        #         print('Error al eliminar la imagen:', err)
        #         return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error al eliminar la imagen'}), 500
        #     else:
        # Subir la nueva imagen (Simulación, ya que en este ejemplo no se utiliza S3)
        # uploadFiletoS3(req.files, process.env.AWS_BUCKET_FOLDER_FOTOS, (err, data) => {
        #     if err:
        #         print('Error al subir el archivo:', err)
        #         return jsonify({'success': False, 'mensaje': 'Ha ocurrido un error al subir la imagen'}), 500
        #     else:
        #         url_imagen = data

        # Consulta para actualizar el álbum con la nueva imagen
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
