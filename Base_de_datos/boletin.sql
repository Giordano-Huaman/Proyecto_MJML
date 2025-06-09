-- Eliminar base de datos anterior (opcional)
DROP DATABASE IF EXISTS boletin;

-- Crear nueva base de datos
CREATE DATABASE boletin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE boletin;

-- Tabla de suscriptores
CREATE TABLE Suscriptores (
    email VARCHAR(255) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    idioma_preferido ENUM('en', 'es') NOT NULL,
    fecha_registro DATE NOT NULL
);

-- Tabla de eventos
CREATE TABLE Eventos (
    id_evento INT AUTO_INCREMENT PRIMARY KEY,
    nombre_evento VARCHAR(100) NOT NULL,
    fecha_evento DATE NOT NULL,
    UNIQUE(nombre_evento, fecha_evento)
);

-- Tabla de suscripciones (relación N:N entre suscriptores y eventos)
CREATE TABLE Suscripciones (
    email VARCHAR(255) NOT NULL,
    id_evento INT NOT NULL,
    PRIMARY KEY (email, id_evento),
    FOREIGN KEY (email) REFERENCES Suscriptores(email) ON DELETE CASCADE,
    FOREIGN KEY (id_evento) REFERENCES Eventos(id_evento) ON DELETE CASCADE
);

-- Tabla de asuntos
CREATE TABLE Asuntos (
    id_asunto INT AUTO_INCREMENT PRIMARY KEY,
    id_evento INT NOT NULL,
    idioma ENUM('en', 'es') NOT NULL,
    texto_asunto VARCHAR(255) NOT NULL,
    UNIQUE(id_evento, idioma),
    FOREIGN KEY (id_evento) REFERENCES Eventos(id_evento) ON DELETE CASCADE
);

-- Tabla de envíos
CREATE TABLE Envios (
    id_envio INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    id_evento INT NOT NULL,
    fecha_envio DATE NOT NULL,
    estado_envio VARCHAR(50),
    UNIQUE(email, id_evento, fecha_envio),
    FOREIGN KEY (email) REFERENCES Suscriptores(email) ON DELETE CASCADE,
    FOREIGN KEY (id_evento) REFERENCES Eventos(id_evento) ON DELETE CASCADE
);

-- Insertar eventos
INSERT INTO Eventos (nombre_evento, fecha_evento) VALUES
('SalondelComic', '2025-02-28'),
('ExpoJove', '2024-12-26');

-- Insertar asuntos para cada evento en ambos idiomas
INSERT INTO Asuntos (id_evento, idioma, texto_asunto) VALUES
-- SalondelComic (id_evento = 1 si es el primero creado)
((SELECT id_evento FROM Eventos WHERE nombre_evento = 'SalondelComic'), 'es', 'Boletín del Salón del Cómic 2025'),
((SELECT id_evento FROM Eventos WHERE nombre_evento = 'SalondelComic'), 'en', '2025 Comic Con Newsletter'),

-- ExpoJove
((SELECT id_evento FROM Eventos WHERE nombre_evento = 'ExpoJove'), 'es', 'Boletín de ExpoJove 2024'),
((SELECT id_evento FROM Eventos WHERE nombre_evento = 'ExpoJove'), 'en', '2024 ExpoJove Newsletter');

