import bcrypt

def hash_password(password):
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed_password.decode('utf-8')


def check_password(input_password, hashed_password):
    return bcrypt.checkpw(input_password.encode('utf-8'), hashed_password.encode('utf-8'))

def compare_password(password, hashed_password):
    try:
        is_match = bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
        return is_match
    except Exception as e:
        return False
