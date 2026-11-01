
const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

const rutaPDF = path.join(
    __dirname,
    "..",
    "documents",
    "estatuto-uasd.pdf"
);

function normalizar(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

// Divide el documento respetando los artículos.
function dividirTextoPorPaginas(texto) {
    const paginas = texto.split(/--\s*(\d+)\s+of\s+113\s*--/gi);
    const fragmentos = [];

    let articuloActual = null;

    for (let i = 1; i < paginas.length; i += 2) {
        const numeroPagina = Number(paginas[i]);
        const contenidoPagina = paginas[i + 1] || "";

        const patronArticulo = /ART[IÍ]CULO\s+(?:N[ÚU]MERO\s+)?(\d+)/gi;

        const coincidencias = [];
        let coincidencia;

        while ((coincidencia = patronArticulo.exec(contenidoPagina)) !== null) {
            coincidencias.push({
                numero: Number(coincidencia[1]),
                inicio: coincidencia.index
            });
        }

        if (coincidencias.length === 0) {
            if (articuloActual !== null && contenidoPagina.trim().length > 100) {
                agregarFragmentos(
                    contenidoPagina,
                    numeroPagina,
                    articuloActual,
                    fragmentos
                );
            }

            continue;
        }

        if (coincidencias[0].inicio > 0 && articuloActual !== null) {
            const textoAnterior = contenidoPagina
                .substring(0, coincidencias[0].inicio)
                .trim();

            if (textoAnterior.length > 100) {
                agregarFragmentos(
                    textoAnterior,
                    numeroPagina,
                    articuloActual,
                    fragmentos
                );
            }
        }

        for (let j = 0; j < coincidencias.length; j++) {
            const actual = coincidencias[j];
            const siguiente = coincidencias[j + 1];

            const fin = siguiente
                ? siguiente.inicio
                : contenidoPagina.length;

            const contenidoArticulo = contenidoPagina
                .substring(actual.inicio, fin)
                .trim();

            articuloActual = actual.numero;

            if (contenidoArticulo.length > 50) {
                agregarFragmentos(
                    contenidoArticulo,
                    numeroPagina,
                    articuloActual,
                    fragmentos
                );
            }
        }
    }

    return fragmentos;
}

// Divide los artículos y calcula las frecuencias una sola vez.
function agregarFragmentos(contenido, pagina, articulo, fragmentos) {
    const tamano = 1400;
    const solapamiento = 250;

    for (
        let inicio = 0;
        inicio < contenido.length;
        inicio += tamano - solapamiento
    ) {
        const fragmento = contenido
            .substring(inicio, inicio + tamano)
            .trim();

        if (fragmento.length < 50) continue;

        const textoNormalizado = normalizar(fragmento);
        const palabras = textoNormalizado.match(/\b[a-z0-9]+\b/g) || [];

        const frecuencias = Object.create(null);

        for (const palabra of palabras) {
            frecuencias[palabra] = (frecuencias[palabra] || 0) + 1;
        }

        fragmentos.push({
            texto: fragmento,
            textoNormalizado,
            frecuencias,
            pagina,
            articulo
        });
    }
}

const palabrasIgnoradas = [
    "que", "cual", "cuales", "como", "cuando",
    "donde", "quien", "quienes", "es", "son",
    "la", "el", "los", "las", "de", "del",
    "en", "un", "una", "y", "o", "por", "para",
    "sobre", "segun", "me", "dime", "explica",
    "universidad", "autonoma", "santo", "domingo",
    "uasd", "estatuto", "universitaria", "universitarias",
    "tiene", "puede", "debe", "ser", "a"
];

const palabrasIgnoradasSet = new Set(palabrasIgnoradas);

// Obtiene las palabras importantes de la pregunta.
function obtenerPalabrasClave(pregunta) {
    const palabras = normalizar(pregunta).match(/\b[a-z0-9]+\b/g) || [];

    return [...new Set(
        palabras.filter((palabra) =>
            palabra.length >= 3 &&
            !palabrasIgnoradasSet.has(palabra)
        )
    )];
}

// Detecta preguntas sobre la comunidad universitaria.
function esPreguntaComunidad(pregunta) {
    return (
        pregunta.includes("comunidad") ||
        pregunta.includes("integran") ||
        pregunta.includes("a quienes une") ||
        pregunta.includes("quienes une") ||
        pregunta.includes("forman parte de la comunidad") ||
        pregunta.includes("integrantes de la universidad")
    );
}

// Calcula la relación entre la pregunta y cada fragmento.
function calcularPuntuacion(palabras, fragmento, preguntaNormalizada) {
    const contenido = fragmento.textoNormalizado;

    let puntuacion = 0;
    let palabrasEncontradas = 0;

    for (const palabra of palabras) {
        const cantidad = fragmento.frecuencias[palabra] || 0;

        if (cantidad > 0) {
            palabrasEncontradas++;
            puntuacion += Math.min(cantidad, 3) * 3;
        }
    }

    // Naturaleza de la Universidad.
    if (preguntaNormalizada.includes("naturaleza")) {
        if (contenido.includes("institucion publica")) puntuacion += 15;
        if (contenido.includes("descentralizada del estado")) puntuacion += 15;
        if (contenido.includes("autonomia garantizada")) puntuacion += 10;

        if (fragmento.articulo !== 1) puntuacion = 0;
    }

    // Composición de la comunidad universitaria.
    if (esPreguntaComunidad(preguntaNormalizada)) {
        const contieneComunidad =
            contenido.includes("profesores") &&
            contenido.includes("estudiantes") &&
            contenido.includes("servidores de apoyo") &&
            contenido.includes("labor academica");

        if (contieneComunidad && fragmento.articulo === 2) {
            puntuacion += 50;
        } else {
            puntuacion = 0;
        }
    }

    // Misión universitaria.
    if (preguntaNormalizada.includes("mision")) {
        if (
            contenido.includes("servidores de apoyo") &&
            contenido.includes("labor academica")
        ) {
            puntuacion += 50;
        } else {
            puntuacion = 0;
        }
    }

    // Evita coincidencias débiles.
    if (
        palabras.length >= 3 &&
        palabrasEncontradas < 2 &&
        !esPreguntaComunidad(preguntaNormalizada)
    ) {
        puntuacion = 0;
    }

    return puntuacion;
}

// Carga y procesa el Estatuto Orgánico.
async function cargarEstatuto() {
    if (!fs.existsSync(rutaPDF)) {
        throw new Error("No se encontró el Estatuto Orgánico.");
    }

    const buffer = fs.readFileSync(rutaPDF);
    const parser = new PDFParse({ data: buffer });

    try {
        const resultado = await parser.getText();
        return dividirTextoPorPaginas(resultado.text);
    } finally {
        await parser.destroy();
    }
}

// Busca los fragmentos más relacionados con la pregunta.
function buscarInformacion(pregunta, fragmentos, cantidad = 2) {
    const preguntaNormalizada = normalizar(pregunta);
    const palabras = obtenerPalabrasClave(preguntaNormalizada);

    if (palabras.length === 0) {
        return [];
    }

    const resultados = [];

    for (const fragmento of fragmentos) {
        const puntuacion = calcularPuntuacion(
            palabras,
            fragmento,
            preguntaNormalizada
        );

        if (puntuacion > 0) {
            resultados.push({
                ...fragmento,
                puntuacion
            });
        }
    }

    if (resultados.length === 0) {
        return [];
    }

    resultados.sort((a, b) => b.puntuacion - a.puntuacion);

    // La pregunta sobre comunidad se responde con el Artículo 2.
    if (esPreguntaComunidad(preguntaNormalizada)) {
        return resultados
            .filter((resultado) => resultado.articulo === 2)
            .slice(0, 1);
    }

    // Para la misión utiliza el fragmento más relevante.
    if (preguntaNormalizada.includes("mision")) {
        return resultados.slice(0, 1);
    }

    const puntuacionMinima = Math.max(
        6,
        resultados[0].puntuacion * 0.70
    );

    return resultados
        .filter((resultado) => resultado.puntuacion >= puntuacionMinima)
        .slice(0, cantidad);
}

module.exports = {
    cargarEstatuto,
    buscarInformacion
};
