#!/bin/bash

# Actualiza la lista de paquetes disponibles
sudo apt update -y

# Realiza una actualización del sistema
sudo apt upgrade -y

# Instala Python 3
sudo apt install python3 -y
sudo apt install python3-pip -y

# Instala MySQL Server
sudo apt install mysql-server -y

# Conectarse a RDS y correr el DDL
mysql -h mysql.cmuruwaihhhp.us-east-1.rds.amazonaws.com -P 3306 -u semi -D semi_db -p < DDL.sql 

#sudo apt-get install git
#git --version
#sudo add-apt-repository ppa:git-core/ppa
#sudo apt update; apt install git