# Proyecto_MJML
Proyecto_Feria_Valencia

# Envío de Boletines con Node.js + MJML + MySQL

Proyecto sencillo para enviar boletines (tipo newsletter) personalizados a usuarios a partir de un archivo CSV y una base de datos MySQL. Usa Node.js, MJML, y SMTP (Gmail por defecto).

---

## ¿Qué hace este proyecto?

- Lee un `.csv` con la info de los suscriptores
- Guarda en MySQL los nuevos suscriptores y suscripciones
- Envía correos personalizados en español o inglés según el idioma del usuario
- Usa archivos `.mjml` para generar el HTML de los emails

---

## Requisitos para que funcione (en Linux/Xubuntu)

### 1. Node.js y npm

Instalar:

sudo apt update

sudo apt install npm

sudo npm install -g n

sudo n stable

Verificamos que está todo bien con:

node -v

npm -v

### 2. Instalar dependencias del proyecto

Desde la carpeta raíz del proyecto:

npm install nodemailer mysql2 csv-parser dotenv mjml

### 3. MySQL (Base de datos)

Instalamos el servidor y ejecutamos el script de la carpeta Base_de_datos

sudo apt install mysql-server

sudo mysql -u root -p < ../Base_de_datos/boletin.sql

introducimos nuestra contraseña (seguramente 'root')

### 4. Creamos el archivo .env con nuestras credenciales

touch .env

EMAIL_USER=tuemail@gmail.com

EMAIL_PASS=tucontraseña_de_app o token de aplicacion

DB_HOST=localhost

DB_USER=root

DB_PASS=contraseña

DB_NAME=boletin

### 5. Creamos el CSV

correos.csv

email,nombre,idioma,fecha_registro,eventos

maria@gmail.com,María,es,2025-01-15,SalondelComic;ExpoJove

john@outlook.com,John,en,2025-01-20,SalondelComic

### 6. Nos aseguramos de que los archivos MJML estén en la carpeta del proyecto

SalondelComic.mjml

SalondelComic_en.mjml

Expojove_final.mjml

Expojove_final_en.mjml

### 7. Ejecutamos el script

node send_MJML_final.js


Trabajo realizado por Giordano Huamán Obregón 1ro de DAW


