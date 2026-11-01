
require("dotenv").config();

async function generarRespuesta(pregunta, fragmentos) {
    if (!fragmentos || fragmentos.length === 0) {
        return "No encontré información suficiente en el Estatuto Orgánico para responder esa pregunta.";
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("Falta configurar la variable GEMINI_API_KEY.");
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
- Si la información es insuficiente, no intentes completar la respuesta con conocimientos externos.

CONTEXTO:
${contexto}

PREGUNTA:
${pregunta}

RESPUESTA:
`;

    const modelo = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

    const respuesta = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0,
                    maxOutputTokens: 300,
                    topP: 0.8
                }
            })
        }
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        console.error("Error de Gemini:", datos);

        throw new Error(
            datos.error?.message || "No se pudo conectar con Gemini."
        );
    }

    const texto = datos.candidates?.[0]?.content?.parts
        ?.map((parte) => parte.text || "")
        .join("")
        .trim();

    if (!texto) {
        throw new Error("Gemini no generó una respuesta.");
    }

    return texto;
}

module.exports = {
    generarRespuesta
};
