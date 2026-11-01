
async function generarRespuesta(pregunta, fragmentos) {
    if (!fragmentos || fragmentos.length === 0) {
        return "No encontré información suficiente en el Estatuto Orgánico para responder esa pregunta.";
    }

    const contexto = fragmentos
        .slice(0, 2)
        .map((fragmento) => `
ARTÍCULO ${fragmento.articulo}
PÁGINA ${fragmento.pagina}

${fragmento.texto}
`)
        .join("\n-------------------------\n");

    const prompt = `
Eres UASD Estatuto AI, asistente especializado en el Estatuto Orgánico de la UASD.

REGLAS:
- Responde siempre en español.
- Utiliza exclusivamente el contexto proporcionado.
- Responde de forma breve, clara y directa.
- No inventes información, fechas ni artículos.
- Menciona el artículo que respalda la respuesta.
- Si el contexto no contiene la respuesta, indícalo claramente.

CONTEXTO:
${contexto}

PREGUNTA:
${pregunta}

RESPUESTA:
`;

    const respuesta = await fetch(
        "http://127.0.0.1:11434/api/generate",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "qwen2.5:1.5b",
                prompt,
                stream: false,
                keep_alive: "30m",
                options: {
                    temperature: 0,
                    num_predict: 120,
                    num_ctx: 2048,
                    top_p: 0.8
                }
            })
        }
    );

    if (!respuesta.ok) {
        throw new Error("No se pudo conectar con Ollama.");
    }

    const datos = await respuesta.json();

    if (!datos.response || !datos.response.trim()) {
        throw new Error("La inteligencia artificial no generó una respuesta.");
    }

    return datos.response.trim();
}

module.exports = {
    generarRespuesta
};
