const fs = require('fs');
const csv = require('csv-parser');
const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');
const mjml = require('mjml');
require('dotenv').config();

// Configuración del servidor SMTP (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Función principal (asyn para esperar a la conexión con la base de datos
(async () => {
  // Conexión a la base de datos MySQL
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  const suscriptores = [];

  // Leer el archivo CSV
  fs.createReadStream('correos.csv')
    .pipe(csv())
    .on('data', row => {
      if (row.email && row.email.includes('@')) {
        const eventos = row.eventos.split(';').map(e => e.trim()); // Separar múltiples eventos
        suscriptores.push({
          email: row.email,
          nombre: row.nombre,
          idioma: row.idioma_preferido,
          fecha: row.fecha_registro,
          eventos,
        });
      }
    })
    .on('end', async () => {
      // Procesar cada suscriptor
      for (const sub of suscriptores) {
        const { email, nombre, idioma, fecha, eventos } = sub;

        // Insertar al suscriptor si no existe
        await connection.execute(`
          INSERT IGNORE INTO Suscriptores (email, nombre, idioma_preferido, fecha_registro)
          VALUES (?, ?, ?, ?)`,
          [email, nombre, idioma, fecha]
        );

        // Procesar cada evento al que está suscrito
        for (const nombreEvento of eventos) {
          // Obtener ID del evento y fecha
          const [[evento]] = await connection.execute(
            `SELECT id_evento, fecha_evento FROM Eventos WHERE nombre_evento = ?`,
            [nombreEvento]
          );
          if (!evento) {
            console.warn(`⚠️ Evento no encontrado: ${nombreEvento}`);
            continue;
          }

          const eventoId = evento.id_evento;
          const fechaEvento = evento.fecha_evento;

          // Insertar suscripción a ese evento
          await connection.execute(`
            INSERT IGNORE INTO Suscripciones (email, id_evento)
            VALUES (?, ?)`, [email, eventoId]);

          // Verificar si ya se envió el boletín a ese email y evento
          const [envios] = await connection.execute(`
            SELECT 1 FROM Envios
            WHERE email = ? AND id_evento = ? AND fecha_envio = ?`,
            [email, eventoId, fecha]
          );
          if (envios.length > 0) {
            console.log(`🔁 Ya se envió a ${email} el boletín de ${nombreEvento}`);
            continue;
          }

          // Obtener el asunto correspondiente del boletín
          const [[asuntoRow]] = await connection.execute(`
            SELECT texto_asunto FROM Asuntos
            WHERE id_evento = ? AND idioma = ?`,
            [eventoId, idioma]
          );
          const asunto = asuntoRow?.texto_asunto || `Boletín ${nombreEvento}`;

          // Determinar nombre del archivo MJML
          let archivoMjml;
          if (nombreEvento.toLowerCase() === 'salondelcomic') {
            archivoMjml = idioma === 'en' ? '../SalondelComic_en.mjml' : '../SalondelComic.mjml';
          } else if (nombreEvento.toLowerCase() === 'expojove') {
            archivoMjml = idioma === 'en' ? '../Expojove_final_en.mjml' : '../Expojove_final.mjml';
          } else {
            console.warn(`⚠️ Archivo MJML no definido para evento: ${nombreEvento}`);
            continue;
          }

          // Verificar existencia del archivo MJML
          if (!fs.existsSync(archivoMjml)) {
            console.warn(`⚠️ Archivo MJML no encontrado: ${archivoMjml}`);
            continue;
          }

          // Leer y convertir MJML a HTML
          const mjmlTemplate = fs.readFileSync(archivoMjml, 'utf8');
          const { html, errors } = mjml(mjmlTemplate);

          if (errors.length) {
            console.error(`❌ Errores de MJML para ${email}:`, errors);
            continue;
          }

          // Enviar el correo
          try {
            await transporter.sendMail({
              from: `Boletín <${process.env.EMAIL_USER}>`,
              to: email,
              subject: asunto,
              html: html,
            });

            // Registrar el envío en la base de datos
            await connection.execute(`
              INSERT INTO Envios (email, id_evento, fecha_envio, estado_envio)
              VALUES (?, ?, ?, ?)`,
              [email, eventoId, fecha, 'enviado']
            );

            console.log(`✅ Correo enviado a ${email} sobre ${nombreEvento}`);
          } catch (err) {
            console.error(`❌ Error al enviar a ${email}: ${err.message}`);

            await connection.execute(`
              INSERT INTO Envios (email, id_evento, fecha_envio, estado_envio)
              VALUES (?, ?, ?, ?)`,
              [email, eventoId, fecha, 'fallido']
            );
          }
        }
      }

      // Cerrar conexión
      await connection.end();
    });
})();
