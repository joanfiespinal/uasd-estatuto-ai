
const {
    cargarEstatuto,
    buscarInformacion
} = require("./services/buscador");

async function probar() {
    console.log("Cargando Estatuto Orgánico...\n");

    const fragmentos = await cargarEstatuto();

    console.log(`Fragmentos encontrados: ${fragmentos.length}`);

    const preguntas = [
        "¿Cuál es la naturaleza de la Universidad Autónoma de Santo Domingo?",
        "¿Cuál es la misión de la universidad?",
        "¿A quiénes une la Universidad?"
    ];

    for (const pregunta of preguntas) {
        const resultados = buscarInformacion(
            pregunta,
            fragmentos,
            4
        );

        console.log("\n==================================");
        console.log("Pregunta:", pregunta);
        console.log("Cantidad de resultados:", resultados.length);

        if (resultados.length === 0) {
            console.log("No se encontraron fragmentos relacionados.");
            continue;
        }

        resultados.forEach((resultado, indice) => {
            console.log(`\nRESULTADO ${indice + 1}`);
            console.log("Artículo:", resultado.articulo);
            console.log("Página:", resultado.pagina);
            console.log("Puntuación:", resultado.puntuacion);
            console.log("\nContenido:");
            console.log(resultado.texto.substring(0, 1000));
        });
    }
}

probar().catch((error) => {
    console.error("Error en la prueba:", error);
});
