const express = require("express");
const cors = require("cors");
const db = require("./config/database");

const app = express();

app.use(cors());
app.use(express.json());

// Ruta principal
app.get("/", (req, res) => {
    res.json({
        mensaje: "Backend de Proyectos Integradores funcionando"
    });
});

// Prueba de conexión con MySQL
app.get("/api/prueba-db", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT 1 AS conectado");

        res.json({
            mensaje: "Conexión con MySQL funcionando",
            resultado: rows
        });
    } catch (error) {
        console.error("ERROR MYSQL COMPLETO:", error);

        res.status(500).json({
            mensaje: "Error de conexión con MySQL",
            error: error.message
        });
    }
});

// Puerto
const PORT = 3000;
const server = app.listen(PORT, () => {
    console.log("======================================");
    console.log("✅ BACKEND INICIADO CORRECTAMENTE");
    console.log(`🌐 http://localhost:${PORT}`);
    console.log(`🛠️ MySQL: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.log(`🗄️ Base de datos: ${process.env.DB_NAME}`);
    console.log("======================================");
});

   