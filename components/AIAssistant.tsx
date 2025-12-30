
import React, { useState, useRef, useEffect } from 'react';
import { gemini } from '../services/gemini';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAssistantProps {
  onClose: () => void;
  theme: 'GNOSIS' | 'ABYSS' | 'BONE';
}

const CODEX_INFO = `
CODEX OPERATIVO - SPECULUM CARITATIS v4.0.1
PROYECTO MAESTRO: AMERICAN FRIENDS OF THE DESIDERIO ARIAS LEGACY, INC. (AFDAL)

OBJETIVOS ESTRATÉGICOS:
1. PRODUCCIÓN FILM: "SANGRE Y HONOR: LA SOMBRA DEL CAUDILLO". Un proyecto cinematográfico sobre la vida del General Desiderio Arias.
2. MUSEO "EL LEÓN DEL CIBAO": Centro cultural dedicado al héroe nacional Desiderio Arias.
3. VELADAS INTERNACIONALES 2026:
   - NY (23 Mayo): Apertura y Legitimación.
   - NJ (9 Mayo): Escalamiento y Alianzas.
   - MIA (25 Abril): Último Cierre y Consolidación.

NODOS OPERATIVOS:
- NODO RESONANCIA (Dashboard): Análisis de fondos AFDAL.
- GNOSIS CONTABLE (Ledger): Registro de patrocinios y donaciones culturales.
- CONVERGENCIAS (Events): Gestión de las 3 Galas Internacionales.
- IMPACTO NODAL (Programs): Medición del avance del Museo y la Película.
- INTEGRIDAD (Compliance): Validación 501(c)(3) para AFDAL.
`;

const AIAssistant: React.FC<AIAssistantProps> = ({ onClose, theme }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Speculum Caritatis activado. He sincronizado la Gnosis para el proyecto AFDAL: Sangre y Honor y el Museo El León del Cibao. ¿Deseas analizar el estado de las Veladas Internacionales 2026 o el presupuesto de producción?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const promptWithContext = `Contexto del Sistema (Codex AFDAL): ${CODEX_INFO}\n\nPregunta del Usuario: ${userMessage}`;
    const response = await gemini.askAssistant(promptWithContext);
    
    setMessages(prev => [...prev, { role: 'assistant', content: response || "Respuesta no disponible." }]);
    setIsLoading(false);
  };

  const panelBg = {
    GNOSIS: 'bg-slate-900 border-white/10',
    ABYSS: 'bg-black border-white/10',
    BONE: 'bg-white border-slate-200'
  }[theme];

  const textColor = theme === 'BONE' ? 'text-slate-900' : 'text-white';

  return (
    <div className={`fixed bottom-24 right-6 w-[400px] h-[600px] rounded-2xl shadow-2xl flex flex-col border z-[60] animate-in slide-in-from-bottom-5 duration-300 overflow-hidden ${panelBg}`}>
      <div className={`p-4 flex items-center justify-between border-b ${theme === 'BONE' ? 'bg-slate-50 border-slate-100' : 'bg-black/50 border-white/5'}`}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <div>
            <h3 className={`text-xs font-black uppercase tracking-tight ${textColor}`}>AFDAL Core Assistant</h3>
            <p className="text-[8px] text-indigo-400 uppercase font-black tracking-widest italic">Legacy Gnosis v4.0.1</p>
          </div>
        </div>
        <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${theme === 'BONE' ? 'hover:bg-slate-200' : 'hover:bg-white/10'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <div ref={scrollRef} className={`flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar ${theme === 'BONE' ? 'bg-slate-50' : 'bg-slate-900'}`}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed ${
              m.role === 'user' 
              ? 'bg-indigo-600 text-white rounded-tr-none shadow-xl font-bold' 
              : (theme === 'BONE' ? 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm italic font-serif' : 'bg-white/5 text-slate-200 border border-white/10 rounded-tl-none italic font-serif')
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className={`p-3 rounded-xl flex items-center space-x-2 border ${theme === 'BONE' ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}>
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      <div className={`p-4 border-t ${theme === 'BONE' ? 'bg-white border-slate-100' : 'bg-black border-white/5'}`}>
        <div className={`flex items-center space-x-2 p-2 rounded-xl transition-all border focus-within:ring-2 focus-within:ring-indigo-500/30 ${
          theme === 'BONE' ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
        }`}>
          <input
            type="text"
            placeholder="Consultar sobre AFDAL o el Legado..."
            className={`flex-1 bg-transparent border-none focus:outline-none text-xs px-2 ${textColor}`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-all ${isLoading ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg active:scale-90'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
