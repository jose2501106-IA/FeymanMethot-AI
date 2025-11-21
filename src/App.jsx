import { useState } from 'react'
import './App.css'
import { GoogleGenerativeAI } from "@google/generative-ai";

function App() {
  const [apiKey, setApiKey] = useState("");
  const [question, setQuestion] = useState("");
  const [cards, setCards] = useState([]); 
  const [imageUrl, setImageUrl] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("dark"); 

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  async function handleSubmit() {
    if (!apiKey) {
      alert("⚠️ Por favor ingresa tu API Key.");
      return;
    }
    
    setLoading(true);
    setCards([]); 
    setImageUrl("");

    try {
      const cleanKey = apiKey.trim();
      const genAI = new GoogleGenerativeAI(cleanKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // 🧠 PROMPT MEJORADO POR EL ARQUITECTO DE PROMPTS
      const prompt = `
      ROL: Actúa como Richard Feynman reencarnado en el año 2030 como Ingeniero Jefe de Innovación Global.
      OBJETIVO: Desglosar el tema técnico complejo "${question}" en una lección magistral de claridad, profundidad y visión futura.

      INSTRUCCIONES DE FORMATO (ESTRICTO):
      1. SÍNTESIS: Sé denso en conocimiento pero económico en palabras (Máx 3-4 frases potentes por tarjeta).
      2. ESTILO VISUAL: Usa **NEGRITAS** para términos técnicos clave y *Cursivas* para énfasis conceptual.
      3. ESTRUCTURA DE SALIDA (Usa el separador "|||" exactamente para dividir las secciones):

      Genera 5 secciones:

      1. DEFINICIÓN DE INGENIERÍA DE PRECISIÓN:
         Define el concepto desde los primeros principios físicos y matemáticos. ¿Cómo funciona realmente el sistema bajo el capó? Evita generalidades de libro de texto.
      |||
      2. EXPLICACIÓN ELI5 (MODELO MENTAL):
         Explícalo para un niño de 12 años sumamente inteligente. No bajes el nivel, baja la barrera de entrada. Usa lenguaje natural y directo.
      |||
      3. PUNTOS CIEGOS Y PARADOJAS (CRÍTICO):
         ¿Qué es lo que la mayoría de estudiantes o ingenieros entiende mal sobre esto? ¿Dónde está la trampa contraintuitiva?
      |||
      4. LA ANALOGÍA SISTÉMICA:
         Conecta este concepto con un sistema mecánico, hidráulico o cotidiano que funcione bajo las mismas leyes físicas. Haz que el concepto haga "clic".
      |||
      5. PROMPT VISUAL (INGLÉS TÉCNICO):
         Solo escribe una descripción visual densa para generar un esquema de ingeniería.
         Formato sugerido: "technical blueprint of [Subject], isometric view, neon schematic lines, highly detailed, engineering diagram style, 8k resolution".
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const parts = text.split('|||').map(p => p.trim());
      
      setCards(parts.slice(0, 4));
      
      if (parts[4]) {
        // V3.0: Imagen Artística (Pollinations)
        // Añadimos palabras clave extra para asegurar el estilo técnico
        const imagePrompt = encodeURIComponent(parts[4] + " schematic, engineering drawing, high quality, 8k, detailed, futuristic, mind map style");
        setImageUrl(`https://image.pollinations.ai/prompt/${imagePrompt}`);
      }
      
    } catch (error) {
      console.error(error);
      setCards(["❌ Error: " + error.message]);
    }
    
    setLoading(false);
  }

  const renderText = (text) => {
    if (!text) return null;
    const htmlContent = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    return <span dangerouslySetInnerHTML={{ __html: htmlContent }} />;
  };

  return (
    <div className={`app-wrapper ${theme}`}>
      <div className="app-container">
        <header className="header">
          <div className="header-top">
            <div className="logo">⚛️</div>
            <button className="theme-switch" onClick={toggleTheme}>
              {theme === 'dark' ? '☀️ Modo Luz' : '🌙 Modo Noche'}
            </button>
          </div>
          <h1>Feynman AI 3.0</h1>
          <p className="subtitle">Ingeniería • Síntesis • Visualización</p>
        </header>

        <div className="legend-box">
          <span className="legend-title">Simbología:</span>
          <div className="legend-item">
            <span className="legend-dot key-color"></span> Concepto Clave
          </div>
          <div className="legend-item">
            <span className="legend-dot emphasis-color"></span> Énfasis/Analogía
          </div>
        </div>
        
        <div className="security-section">
          <input 
            type="password" 
            className="input-field"
            placeholder="🔑 Pega tu API Key aquí..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>

        <div className="chat-section">
          <textarea 
            className="textarea-field"
            placeholder="Tema complejo (Ej: Reactores de Fusión, Redes Neuronales...)"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows="2"
          />
          
          <button 
            className="action-button"
            onClick={handleSubmit} 
            disabled={loading || !question}
          >
            {loading ? <span className="loader"></span> : "Generar Estudio Completo 🚀"}
          </button>
        </div>

        {cards.length > 0 && (
          <div className="results-area">
            <div className="cards-grid">
              {cards[0] && (
                <div className="feynman-card card-tech">
                  <h3>📐 Definición Técnica</h3>
                  <p>{renderText(cards[0])}</p>
                </div>
              )}
              {cards[1] && (
                <div className="feynman-card card-eli5">
                  <h3>👶 Explicación Simple</h3>
                  <p>{renderText(cards[1])}</p>
                </div>
              )}
              {cards[2] && (
                <div className="feynman-card card-gaps">
                  <h3>🚧 Puntos Ciegos</h3>
                  <p>{renderText(cards[2])}</p>
                </div>
              )}
              {cards[3] && (
                <div className="feynman-card card-analogy">
                  <h3>💡 Analogía Sistémica</h3>
                  <p>{renderText(cards[3])}</p>
                </div>
              )}
            </div>

            {imageUrl && (
              <div className="image-card">
                <h3>🖼️ Esquema Visual IA</h3>
                <div className="image-container">
                  <img src={imageUrl} alt="Diagrama generado por IA" />
                </div>
                <p className="image-note">*Esquema generado en tiempo real.</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <footer className="footer">
        Ingeniería Industrial & IA • Vision 2030
      </footer>
    </div>
  )
}

export default App