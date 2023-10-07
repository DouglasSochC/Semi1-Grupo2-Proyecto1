#!/bin/bash

# Actualiza la lista de paquetes disponibles
sudo apt update -y

# Realiza una actualización del sistema
sudo apt upgrade -y

# Instalar NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Instalar la última versión estable de Node.js
nvm install stable

# Establecer la versión de Node.js por defecto
nvm alias default stable

# Mostrar la versión de Node.js y npm instaladas
echo "Node.js version:"
node -v
echo "npm version:"
npm -v

# Instala MySQL Server
sudo apt install mysql-server -y

# Conectarse a RDS y correr el DDL
mysql -h (pegar aqui el dns de RDS) -P 3306 -u (pegar aqui a el usuario) -D (pegar aqui el nombre de la BD) -p < DDL.sql 
