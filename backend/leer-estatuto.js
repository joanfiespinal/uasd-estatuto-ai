
const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

async function leerEstatuto() {
    let parser;

    try {
        const rutaPDF = path.join(
            __dirname,
            "documents",
            "estatuto-uasd.pdf"
        );

        if (!fs.existsSync(rutaPDF)) {
            throw new Error("No se encontró el archivo PDF: " + rutaPDF);
        }

        const buffer = fs.readFileSync(rutaPDF);

        parser = new PDFParse({ data: buffer });

        const resultado = await parser.getText();

        console.log("==================================");
        console.log("ESTATUTO ORGÁNICO DE LA UASD");
        console.log("==================================");

        console.log("Total de páginas:", resultado.total);
        console.log("Caracteres extraídos:", resultado.text.length);

        console.log("\nPRIMEROS 1500 CARACTERES:\n");
        console.log(resultado.text.substring(0, 1500));

        console.log("\n==================================");
        console.log("LECTURA COMPLETADA");
        console.log("==================================");

    } catch (error) {
        console.error("Error al leer el Estatuto:", error.message);

    } finally {
        if (parser) {
            await parser.destroy();
        }
    }
}

leerEstatuto();
