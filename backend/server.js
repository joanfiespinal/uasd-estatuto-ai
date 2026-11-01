
const express = require("express");
const cors = require("cors");

const {
    cargarEstatuto,
    buscarInformacion
} = require("./services/buscador");

const {
    generarRespuesta
} = require("./services/ia");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

let fragmentosEstatuto = [];

// Comprobar que el servidor funciona
app.get("/", (req, res) => {
    res.json({
        mensaje: "UASD Estatuto AI está funcionando.",
        fragmentosCargados: fragmentosEstatuto.length
    });
});

// Eliminar fuentes inválidas y repetidas
function prepararFuentes(resultados) {
    const fuentesUnicas = new Map();

    for (const fragmento of resultados) {
        const articulo = Number(fragmento.articulo);
        const pagina = Number(fragmento.pagina);

        // Validar que los datos sean números enteros positivos.
        if (
            !Number.isInteger(articulo) ||
            articulo <= 0 ||
            !Number.isInteger(pagina) ||
            pagina <= 0
        ) {
            continue;
        }

        const clave = `${articulo}-${pagina}`;

        if (!fuentesUnicas.has(clave)) {
            fuentesUnicas.set(clave, {
                articulo,
                pagina
            });
        }
    }

    return [...fuentesUnicas.values()];
}

// Ruta principal del chatbot
app.post("/api/chat", async (req, res) => {
    try {
        const { pregunta } = req.body;

        if (
            !pregunta ||
            typeof pregunta !== "string" ||
            !pregunta.trim()
        ) {
            return res.status(400).json({
                error: "Debes escribir una pregunta."
            });
        }

        const preguntaLimpia = pregunta.trim();

        console.log("\n----------------------------------");
        console.log("PREGUNTA RECIBIDA:");
        console.log(preguntaLimpia);

        // Buscar información en el Estatuto.
        const resultados = buscarInformacion(
            preguntaLimpia,
            fragmentosEstatuto,
            2
        );
        console.log("FRAGMENTOS ENCONTRADOS:", resultados.length);
console.log("RESULTADOS:", resultados);

        if (!resultados || resultados.length === 0) {
            console.log("No se encontraron resultados.");

            return res.json({
                respuesta: "No encontré información suficiente en el Estatuto Orgánico para responder esa pregunta.",
                fuentes: []
            });
        }

        // Mostrar los resultados reales del buscador.
        console.log("\nFRAGMENTOS SELECCIONADOS:");

        console.table(
            resultados.map((fragmento) => ({
                articulo: fragmento.articulo,
                pagina: fragmento.pagina,
                puntuacion: fragmento.puntuacion
            }))
        );

        // Preparar fuentes válidas y sin duplicados.
        const fuentes = prepararFuentes(resultados);

        console.log("\nFUENTES VÁLIDAS:");
        console.table(fuentes);

        // Generar respuesta con inteligencia artificial.
        const respuesta = await generarRespuesta(
            preguntaLimpia,
            resultados
        );

        res.json({
            respuesta,
            fuentes
        });

        console.log("\nRESPUESTA GENERADA CORRECTAMENTE.");
        console.log("----------------------------------");

    } catch (error) {
        console.error("\nERROR EN EL CHATBOT:");
        console.error(error);

        res.status(500).json({
            error: "Ocurrió un problema al generar la respuesta. Comprueba que Ollama esté funcionando."
        });
    }
});

// Cargar el Estatuto antes de iniciar el servidor.
async function iniciarServidor() {
    try {
        console.log("----------------------------------");
        console.log("INICIANDO UASD ESTATUTO AI");
        console.log("----------------------------------");

        console.log("Cargando el Estatuto Orgánico...");

        fragmentosEstatuto = await cargarEstatuto();

        console.log(
            `Estatuto cargado correctamente: ${fragmentosEstatuto.length} fragmentos.`
        );

        app.listen(PORT, "0.0.0.0", () => {
            console.log("----------------------------------");
            console.log("UASD ESTATUTO AI");
            console.log(`Servidor: http://localhost:${PORT}`);
            console.log("Estado: LISTO");
            console.log("----------------------------------");
        });

    } catch (error) {
        console.error("No se pudo iniciar el servidor:");
        console.error(error);

        process.exit(1);
    }
}

iniciarServidor();
