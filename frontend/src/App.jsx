import { useState, useEffect, useRef } from "react";
import "./App.css";

const preguntasSugeridas = [
  "¿Cuál es la naturaleza de la UASD?",
  "¿Cuál es la misión de la universidad?",
  "¿Qué establece el Estatuto sobre la autonomía universitaria?",
  "¿A quiénes une la Universidad?"
];

function App() {
  const [pregunta, setPregunta] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(false);

  const controladorRef = useRef(null);
  const mensajesRef = useRef(null);

  // Desplazar automáticamente el chat al último mensaje.
  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTo({
        top: mensajesRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [mensajes, cargando]);

  // Cancelar cualquier consulta pendiente al salir del componente.
  useEffect(() => {
    return () => {
      controladorRef.current?.abort();
    };
  }, []);

  function nuevaConversacion() {
    controladorRef.current?.abort();
    controladorRef.current = null;

    setMensajes([]);
    setPregunta("");
    setCargando(false);
  }

  async function enviarPregunta(texto = pregunta) {
    const preguntaLimpia = texto.trim();

    if (!preguntaLimpia || cargando) return;

    const controlador = new AbortController();
    controladorRef.current = controlador;

    setMensajes((anteriores) => [
      ...anteriores,
      {
        tipo: "usuario",
        texto: preguntaLimpia
      }
    ]);

    setPregunta("");
    setCargando(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const respuesta = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          pregunta: preguntaLimpia
        }),
        signal: controlador.signal
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.error || "No se pudo obtener una respuesta."
        );
      }

      setMensajes((anteriores) => [
        ...anteriores,
        {
          tipo: "ia",
          texto: datos.respuesta,
          fuentes: datos.fuentes || []
        }
      ]);
    } catch (error) {
      if (error.name === "AbortError") return;

      console.error("Error al consultar el chatbot:", error);

      setMensajes((anteriores) => [
        ...anteriores,
        {
          tipo: "ia",
          texto:
            "No pude conectar con el servidor. Comprueba que el backend y Ollama estén funcionando.",
          fuentes: []
        }
      ]);
    } finally {
      if (controladorRef.current === controlador) {
        controladorRef.current = null;
        setCargando(false);
      }
    }
  }

  function manejarTecla(evento) {
    if (evento.key === "Enter" && !evento.shiftKey) {
      evento.preventDefault();
      enviarPregunta();
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">U</div>

          <div>
            <h2>UASD AI</h2>
            <span>ASISTENTE ACADÉMICO</span>
          </div>
        </div>

        <button
          className="nuevo-chat"
          onClick={nuevaConversacion}
        >
          + Nueva conversación
        </button>

        <div className="sidebar-info">
          <span className="status-dot"></span>
          Sistema local conectado
        </div>

        <div className="sidebar-bottom">
          <p>CONSULTA DOCUMENTAL</p>
          <span>Estatuto Orgánico UASD</span>
          <span>Edición del documento: 2012</span>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <span className="topbar-label">
              ASISTENTE INTELIGENTE
            </span>

            <h3>Estatuto Orgánico</h3>
          </div>

          <div className="online">
            <span className="status-dot"></span>
            En línea
          </div>
        </header>

        <section className="chat-area" ref={mensajesRef}>
          {mensajes.length === 0 ? (
            <div className="welcome">
              <div className="welcome-icon">✦</div>

              <span className="eyebrow">
                BIENVENIDO A UASD ESTATUTO AI
              </span>

              <h1>
                ¿Qué deseas saber
                <br />
                sobre la <span>UASD?</span>
              </h1>

              <p>
                Consulta el Estatuto Orgánico de la Universidad
                Autónoma de Santo Domingo mediante preguntas
                en lenguaje natural.
              </p>

              <div className="suggestions">
                <h4>PREGUNTAS SUGERIDAS</h4>

                {preguntasSugeridas.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => enviarPregunta(item)}
                    disabled={cargando}
                  >
                    <span>✧</span>
                    {item}
                    <span className="suggestion-arrow">↗</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="messages">
              {mensajes.map((mensaje, index) => (
                <div
                  className={`message ${mensaje.tipo}`}
                  key={index}
                >
                  <div className="avatar">
                    {mensaje.tipo === "usuario" ? "TÚ" : "U"}
                  </div>

                  <div className="message-content">
                    <span className="message-author">
                      {mensaje.tipo === "usuario"
                        ? "Tú"
                        : "UASD Estatuto AI"}
                    </span>

                    <p>{mensaje.texto}</p>

                    {mensaje.fuentes?.length > 0 && (
                      <div className="sources">
                        <strong>Fuentes del Estatuto:</strong>

                        {mensaje.fuentes.map((fuente, i) => (
                          <span key={i}>
                            Artículo {fuente.articulo ?? "No identificado"}
                            {" · "}
                            Página {fuente.pagina ?? "No identificada"}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {cargando && (
                <div className="message ia">
                  <div className="avatar">U</div>

                  <div className="message-content">
                    <span className="message-author">
                      UASD Estatuto AI
                    </span>

                    <p className="loading-text">
                      Analizando el Estatuto...
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <footer className="composer-area">
          <div className="composer">
            <textarea
              value={pregunta}
              onChange={(evento) => setPregunta(evento.target.value)}
              onKeyDown={manejarTecla}
              placeholder="Escribe tu pregunta sobre el Estatuto Orgánico..."
              rows="1"
              disabled={cargando}
            />

            <button
              className="send-button"
              onClick={() => enviarPregunta()}
              disabled={!pregunta.trim() || cargando}
              aria-label="Enviar pregunta"
            >
              ↑
            </button>
          </div>

          <p>
            Las respuestas se generan utilizando el documento
            del Estatuto Orgánico cargado en el sistema.
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;