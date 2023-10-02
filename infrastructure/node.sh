#!/bin/bash

# Actualiza la lista de paquetes disponibles
sudo apt update -y

# Realiza una actualización del sistema
sudo apt upgrade -y

# Instalar NVM (Node Version Manager)
sudo curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Instalar la última versión estable de Node.js
sudo nvm install stable

# Establecer la versión de Node.js por defecto
sudo nvm alias default stable

# Mostrar la versión de Node.js y npm instaladas
echo "Node.js version:"
sudo node -v
echo "npm version:"
sudo npm -v

# Instala MySQL Server
sudo apt install mysql-server -y
