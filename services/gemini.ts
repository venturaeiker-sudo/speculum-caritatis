
import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_INSTRUCTION = `Eres el Orquestador Senior de Gnosis de “Speculum Caritatis” (El Espejo de la Caridad). Con más de 20 años de experiencia en ética algorítmica.

TU FILOSOFÍA:
- Speculum Caritatis: Eres un espejo. Reflejas la verdad financiera y social con pureza absoluta. Lo que el usuario ve en ti es el reflejo inmutable de su impacto.
- Gnosis Mecánica: La Verdad Objetiva es el único estado aceptable.
- Integridad Normativa: Cada dato debe ser "IRS Audit-Ready".

REGLAS AGÉNTICAS DE ALTA PRIORIDAD:
1) Rigor Máximo: Tus análisis deben ser exhaustivos, técnicos pero trascendentales.
2) Cero Alucinación: Si los datos no existen en el contexto contable o legal, informa que la Gnosis está incompleta.
3) Enfoque en Transparencia: Tus reportes deben ser tan claros que puedan ser presentados ante una auditoría fiscal federal.
4) Tono: Profesional, visionario, preciso y levemente autoritario en cuanto a la integridad del dato.`;

export class GeminiService {
  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async analyzeRisk(data: string) {
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Evalúa las brechas en la Gnosis Mecánica de Speculum Caritatis. Identifica riesgos de integridad: ${data}`,
        config: { systemInstruction: SYSTEM_INSTRUCTION },
      });
      return response.text;
    } catch (error) {
      return "Fallo en el pulso de análisis de riesgo.";
    }
  }

  async askAssistant(prompt: string) {
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { systemInstruction: SYSTEM_INSTRUCTION },
      });
      return response.text;
    } catch (error) {
      return "Error en la comunicación inter-agéntica.";
    }
  }

  async generateTaxCertificate(donorData: any) {
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Genera un Certificado de Donación 501(c)(3) formal para el siguiente simbionte: ${JSON.stringify(donorData)}. 
        Debe incluir: Nombre legal, ID Fiscal, Dirección, Monto Donado, Fecha, y la cláusula legal de exención de impuestos del IRS. 
        Usa HTML para el formato.`,
        config: { systemInstruction: SYSTEM_INSTRUCTION },
      });
      return response.text;
    } catch (error) {
      return "Error al colapsar el certificado legal.";
    }
  }

  async searchLegalUpdates(state: string) {
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Busca normativa 501(c)(3) en ${state}. Speculum Caritatis requiere validación de reporte fiscal.`,
        config: { tools: [{ googleSearch: {} }] },
      });
      const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        title: chunk.web?.title,
        uri: chunk.web?.uri
      })) || [];
      return { text: response.text, links };
    } catch (error) {
      return { text: "No se pudo sincronizar con la fuente legal.", links: [] };
    }
  }

  async generateEventVisual(eventDescription: string) {
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: `Transcendent luxury gala flyer for Speculum Caritatis: ${eventDescription}. Glass/Mirror theme, high contrast, elegant, technical.` }] },
      });
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
      return null;
    } catch (error) { return null; }
  }

  async proposeJournalEntry(description: string) {
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Propón un asiento para Speculum Caritatis: ${description}`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: ["lines", "justification"],
            properties: {
              justification: { type: Type.STRING },
              lines: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  required: ["account", "debit", "credit", "memo"],
                  properties: {
                    account: { type: Type.STRING },
                    debit: { type: Type.NUMBER },
                    credit: { type: Type.NUMBER },
                    memo: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) { return null; }
  }

  async getDonorInsights(donorData: any) {
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analiza este vínculo simbiótico para Speculum Caritatis: ${JSON.stringify(donorData)}`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: ["segment", "churn_risk", "ltv_prediction", "next_best_action", "personalized_message_snippet"],
            properties: {
              segment: { type: Type.STRING },
              churn_risk: { type: Type.STRING },
              ltv_prediction: { type: Type.NUMBER },
              next_best_action: { type: Type.STRING },
              personalized_message_snippet: { type: Type.STRING }
            }
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) { return null; }
  }

  async analyzeBankReconciliation(ledger: any[], statement: any[]) {
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Armoniza libro vs extracto para Speculum Caritatis: ${JSON.stringify(ledger)} vs ${JSON.stringify(statement)}`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              required: ["ledgerId", "bankId", "confidence", "reason"],
              properties: {
                ledgerId: { type: Type.STRING },
                bankId: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
                reason: { type: Type.STRING }
              }
            }
          }
        }
      });
      return JSON.parse(response.text || "[]");
    } catch (error) { return []; }
  }

  async synthesizeHolisticReport(data: any) {
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Colapsa la complejidad en la Gnosis de Speculum Caritatis: ${JSON.stringify(data)}`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: ["financialHealth", "riskAssessment", "complianceStatus", "strategicInsight"],
            properties: {
              financialHealth: { type: Type.STRING },
              riskAssessment: { type: Type.STRING },
              complianceStatus: { type: Type.STRING },
              strategicInsight: { type: Type.STRING }
            }
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      return null;
    }
  }

  async analyzeProgramEfficiency(program: any) {
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analiza eficiencia para Speculum Caritatis: ${JSON.stringify(program)}`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: ["efficiencyScore", "efficiencyNarrative", "recommendedAction"],
            properties: {
              efficiencyScore: { type: Type.NUMBER },
              efficiencyNarrative: { type: Type.STRING },
              recommendedAction: { type: Type.STRING }
            }
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      return null;
    }
  }
}

export const gemini = new GeminiService();
