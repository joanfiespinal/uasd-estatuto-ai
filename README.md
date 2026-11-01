Chatbot inteligente para la consulta del Estatuto Orgánico de la Universidad Autónoma de Santo Domingo (UASD)

1. Introducción

UASD Estatuto AI es una aplicación web que permite a los usuarios realizar preguntas en lenguaje natural sobre el Estatuto Orgánico de la Universidad Autónoma de Santo Domingo. Su propósito es facilitar el acceso a la información institucional mediante un chatbot que utiliza inteligencia artificial para generar respuestas basadas en el contenido del documento oficial.

2. Tecnologías utilizadas

Para desarrollar el sistema se utilizaron las siguientes tecnologías:

React: biblioteca utilizada para construir la interfaz de usuario del chatbot.

Vite: herramienta utilizada para configurar y ejecutar el proyecto frontend.

Node.js: entorno de ejecución utilizado para desarrollar el servidor.

Express.js: framework utilizado para crear el backend y gestionar las solicitudes del chatbot.

JavaScript: lenguaje de programación utilizado en el desarrollo del frontend y backend.

Gemini API: servicio de inteligencia artificial de Google utilizado para interpretar las preguntas y generar respuestas.

PDF-Parse: herramienta utilizada para extraer el contenido textual del Estatuto Orgánico en formato PDF.

Render: plataforma utilizada para publicar el frontend y el backend en Internet.

Git y GitHub: herramientas utilizadas para el control de versiones y el almacenamiento del código fuente.

3. Arquitectura del sistema

El sistema utiliza una arquitectura cliente-servidor, dividida principalmente en dos componentes:

Frontend (React + Vite):

Es la parte visual con la que interactúa el usuario. Permite escribir preguntas, enviarlas al servidor y visualizar las respuestas generadas por el chatbot.

Backend (Node.js + Express):

Es el encargado de recibir las preguntas, buscar información relacionada dentro del Estatuto Orgánico y comunicarse con la API de Gemini para generar las respuestas.

La comunicación entre ambas partes se realiza mediante solicitudes HTTP utilizando una API.

4. Integración de la inteligencia artificial

La inteligencia artificial se integró mediante la API de Gemini de Google.

Cuando el usuario realiza una pregunta, el backend busca primero información relacionada dentro del contenido del Estatuto Orgánico. Posteriormente, los fragmentos encontrados se envían a Gemini como contexto para que el modelo pueda elaborar una respuesta en lenguaje natural.

Se configuró el modelo Gemini 3.5 Flash Lite mediante una variable de entorno, junto con la clave de acceso a la API, para mantener protegida esta información.

El sistema está orientado a generar respuestas basadas en los fragmentos recuperados del documento institucional, evitando que la inteligencia artificial responda sin tomar en cuenta la fuente documental.

5. Funcionamiento del chatbot

El funcionamiento general del sistema se desarrolla mediante los siguientes pasos:

El usuario accede a la aplicación web.

Escribe una pregunta relacionada con el Estatuto Orgánico de la UASD.

El frontend envía la pregunta al backend.

El backend procesa la consulta y busca los fragmentos relacionados con la pregunta.

Los fragmentos encontrados se envían a Gemini como información de contexto.

Gemini genera una respuesta utilizando la información proporcionada.

El backend devuelve la respuesta y las referencias correspondientes al frontend.

El chatbot presenta el resultado al usuario.

6. Uso del Estatuto Orgánico como fuente de información

El Estatuto Orgánico de la Universidad Autónoma de Santo Domingo constituye la fuente principal de información del proyecto.

El documento fue incorporado al backend en formato PDF y procesado para extraer su contenido textual. Posteriormente, la información se organizó en 370 fragmentos para facilitar las búsquedas.

Cuando se realiza una consulta, el sistema utiliza un mecanismo de búsqueda que identifica los fragmentos relacionados con las palabras y el contenido de la pregunta. Los resultados seleccionados se utilizan como contexto para generar la respuesta mediante Gemini.

De esta manera, el chatbot facilita la consulta de artículos y disposiciones del Estatuto Orgánico, incluyendo referencias al contenido utilizado para responder.

7. Conclusión

El desarrollo de UASD Estatuto AI permitió integrar tecnologías de desarrollo web e inteligencia artificial para crear una herramienta de consulta institucional. El proyecto demuestra cómo la combinación de React, Node.js, Express y Gemini puede facilitar el acceso a documentos universitarios mediante preguntas formuladas en lenguaje natural.

La aplicación busca ofrecer una experiencia de consulta sencilla, rápida y fundamentada en el Estatuto Orgánico de la UASD.
