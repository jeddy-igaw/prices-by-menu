import React, { useState, useEffect } from 'react';
import { Sparkles, Utensils } from 'lucide-react';
import ImageUpload from './components/ImageUpload';
import MenuList from './components/MenuList';
import { analyzeMenuAndTranslate } from './services/gemini';
import { getExchangeRate } from './services/currency';

function App() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const [menuItems, setMenuItems] = useState([]);
  const [lastUploadedFile, setLastUploadedFile] = useState(null);
  const [uploadKey, setUploadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageAnalysis = async (file) => {
    setLastUploadedFile(file);
    if (!file) {
      setMenuItems([]);
      return;
    }

    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      setError("API 키가 설정되지 않았습니다. .env 파일을 확인해 주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Analyze Menu (OCR + Translate)
      const textResult = await analyzeMenuAndTranslate(file, apiKey);

      if (!Array.isArray(textResult)) {
        throw new Error("AI 응답 형식이 올바르지 않습니다.");
      }

      // 2. Currency Conversion
      // We'll try to find a common currency among items or just convert each one.
      // Optimization: Fetch rate once if all items have same currency
      const itemsWithPrices = await Promise.all(textResult.map(async (item) => {
        if (item.price && item.currency) {
          try {
            // Basic caching could be added here, but for now we fetch (or use simple logic)
            // Note: getExchangeRate handles caching/optimization internally if we expanded it, 
            // but here we just call it. To avoid rate limits, we might want to be careful, 
            // but for a menu with mixed items or single currency it's fine.
            const rate = await getExchangeRate(item.currency, 'KRW');
            if (rate) {
              return { ...item, convertedPrice: Math.round(item.price * rate) };
            }
          } catch (e) {
            console.warn("Conversion failed for item", item.name);
          }
        }
        return item;
      }));

      setMenuItems(itemsWithPrices);

    } catch (err) {
      setError(err.message || "오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMenuItems([]);
    setLastUploadedFile(null);
    setError(null);
    setIsLoading(false);
    setUploadKey(prev => prev + 1);
  };

  const handleRetry = () => {
    if (lastUploadedFile) {
      handleImageAnalysis(lastUploadedFile);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">
          <Sparkles className="logo-icon" />
          <h1>Jeddy's Translator</h1>
        </div>
        <div className="header-actions">
          <button onClick={handleReset} className="reset-button">
            새 메뉴판
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="hero-section">
          <h2>AI 스마트 메뉴</h2>
          <p>메뉴판 사진을 올리면 한국어 설명과 원화(KRW) 가격을 알려드려요!</p>
        </div>

        <ImageUpload key={uploadKey} onImageSelect={handleImageAnalysis} isLoading={isLoading} />

        {error && (
          <div className="error-message">
            <Utensils className="error-icon" />
            <p>{error}</p>
          </div>
        )}

        {menuItems.length > 0 && (
          <div className="retry-section">
            <button onClick={handleRetry} className="retry-button" disabled={isLoading}>
              {isLoading ? '생성 중...' : '다시 분석하기'}
            </button>
          </div>
        )}

        <MenuList items={menuItems} />
      </main>

      <footer className="app-footer">
        <p>Powered by Jeddy</p>
      </footer>
    </div>
  );
}

export default App;
