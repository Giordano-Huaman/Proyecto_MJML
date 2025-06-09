const fs = require('fs');
const mjml = require('mjml');
const nodemailer = require('nodemailer');
const csv = require('csv-parser'); // <-- Asegúrate de instalarlo: npm install csv-parser
require('dotenv').config();

const results = [];

// Leer archivo CSV
fs.createReadStream('correos.csv')
  .pipe(csv({ headers: ['nombre', 'correo'] }))
  .on('data', (data) => results.push(data))
  .on('end', () => {
    // Leer y convertir MJML
    const mjmlTemplate = fs.readFileSync('Expojove_final.mjml', 'utf-8');
    const { html, errors } = mjml(mjmlTemplate);

    if (errors.length) {
      console.error('Errores de MJML:', errors);
      process.exit(1);
    }

    // Configurar transporte SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Enviar correos a cada destinatario
    results.forEach(({ nombre, correo }) => {
    if (!correo || !correo.includes('@')) {
      console.warn(`Correo inválido o vacío para: ${nombre}, se omite.`);
      return;
    }

    const mailOptions = {
      from: 'Giordano_Expojove <giordan9698@gmail.com>',
      to: correo,
      subject: 'Expojove_Expositores',
      html: html,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(`Error al enviar a ${correo}:`, error);
      } else {
        console.log(`Correo enviado a ${correo}:`, info.response);
      }
    });
  });

  });
