import { GoogleGenerativeAI } from "@google/generative-ai";

const fileToGenerativePart = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Data = reader.result.split(",")[1];
            resolve({
                inlineData: {
                    data: base64Data,
                    mimeType: file.type,
                },
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export const analyzeMenuAndTranslate = async (imageFile, apiKey) => {
    if (!apiKey) {
        throw new Error("API Key is missing");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // 최신 모델 사용 (속도와 정확성을 위해 flash 모델 권장)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const imagePart = await fileToGenerativePart(imageFile);

    const prompt = `
    Analyze this menu image. 
    Identify all the menu items, their descriptions (if available), and prices.
    
    1. EXTRACT the original text for the menu item name.
    2. TRANSLATE the description to KOREAN. If there is no description, create a short appetizing description in Korean based on the menu name.
    3. IDENTIFY the price and the currency. Estimate the currency based on the language/location context if symbols are missing (e.g., Japanese text -> JPY, English/$ -> USD, European -> EUR).
    
    Return the response ONLY as a valid JSON array of objects.
    
    Each object must have the following structure:
    {
      "name": "Original Menu Name (in original language)",
      "koreanName": "Menu Name translated to Korean",
      "description": "Appetizing description in Korean",
      "price": number (e.g., 15.50, 1200),
      "currency": "Currency Code (USD, EUR, JPY, KRW, etc.)"
    }
    
    Do not include any markdown formatting (like \`\`\`json). Just the raw JSON string.
  `;

    try {
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Cleanup potential markdown formatting
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(cleanText);
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("메뉴판 분석에 실패했습니다. 다시 시도해 주세요.");
    }
};
