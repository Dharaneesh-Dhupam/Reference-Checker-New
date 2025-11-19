import { GoogleGenAI } from "@google/genai";
import { ReferenceResult, ValidationStatus } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is set.");
  }
  return new GoogleGenAI({ apiKey });
};

export const verifySingleReference = async (text: string, id: string): Promise<ReferenceResult> => {
  const ai = getClient();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Verify this academic reference:\n\n${text}\n\nYou MUST output a JSON object.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        temperature: 0.1,
      },
    });

    const rawText = response.text || "";
    let jsonString = rawText;

    // 1. Extract JSON block
    const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/) || rawText.match(/```\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonString = jsonMatch[1];
    } else {
       const firstOpen = rawText.indexOf('{');
       const lastClose = rawText.lastIndexOf('}');
       if (firstOpen !== -1 && lastClose !== -1) {
           jsonString = rawText.substring(firstOpen, lastClose + 1);
       }
    }

    let parsed: any;

    try {
      if (!jsonString.trim()) throw new Error("Empty JSON string found");
      parsed = JSON.parse(jsonString);
    } catch (e) {
      console.warn("Initial JSON parse failed, attempting to sanitize...", e);
      
      let sanitized = jsonString;

      // Fix 1: Bad Unicode escapes (\u not followed by 4 hex digits)
      sanitized = sanitized.replace(/\\u(?![0-9a-fA-F]{4})/g, '\\\\u');

      // Fix 2: General unescaped backslashes (excluding valid escapes)
      sanitized = sanitized.replace(/\\(?![/\\bfnrtu"'])/g, '\\\\');
      
      // Fix 3: Specific LaTeX command fixes
      sanitized = sanitized.replace(/\\b(?=[a-zA-Z])/g, '\\\\b');
      sanitized = sanitized.replace(/\\f(?=[a-zA-Z])/g, '\\\\f');
      sanitized = sanitized.replace(/\\n(?=[a-zA-Z])/g, '\\\\n'); 
      sanitized = sanitized.replace(/\\r(?=[a-zA-Z])/g, '\\\\r'); 
      sanitized = sanitized.replace(/\\t(?=[a-zA-Z])/g, '\\\\t'); 

      // Fix 4: Fix unquoted keys
      const KNOWN_KEYS = ["status", "correctedCitation", "details", "alternatives", "sourceUrl"];
      const keyPattern = KNOWN_KEYS.join("|");
      const regex = new RegExp(`([{,]\\s*)(${keyPattern})\\s*:`, 'g');
      sanitized = sanitized.replace(regex, '$1"$2":');

      // Fix 5: Fix single quoted keys
      const regexSingle = new RegExp(`([{,]\\s*)'(${keyPattern})'\\s*:`, 'g');
      sanitized = sanitized.replace(regexSingle, '$1"$2":');

      // Fix 6: Trailing commas
      sanitized = sanitized.replace(/,(\s*[}\]])/g, '$1');

      try {
         parsed = JSON.parse(sanitized);
      } catch (e2) {
         console.error("Sanitized JSON parse failed:", e2);
         // Fallback to returning text as detail in an UNCERTAIN result
         return {
            id,
            originalText: text,
            status: ValidationStatus.UNCERTAIN,
            details: "Could not parse AI analysis. Raw output: " + rawText.substring(0, 200) + "...",
            alternatives: []
         };
      }
    }

    // Normalize response to ReferenceResult
    return {
        id,
        originalText: text,
        status: Object.values(ValidationStatus).includes(parsed.status) ? parsed.status : ValidationStatus.UNCERTAIN,
        correctedCitation: parsed.correctedCitation || undefined,
        details: parsed.details || "Analysis complete.",
        alternatives: Array.isArray(parsed.alternatives) ? parsed.alternatives : [],
        sourceUrl: typeof parsed.sourceUrl === 'string' ? parsed.sourceUrl : undefined
    };

  } catch (error) {
    console.error("Gemini API Error for single ref:", error);
    return {
        id,
        originalText: text,
        status: ValidationStatus.UNCERTAIN,
        details: "Verification failed due to technical error.",
        alternatives: []
    };
  }
};