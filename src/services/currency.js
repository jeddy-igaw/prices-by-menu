/**
 * Fetches the latest exchange rates for a given base currency.
 * Uses a free public API (frankfurter.app) which is reliable for major currencies.
 * Fallback to static rates if API fails.
 */
export const getExchangeRate = async (baseCurrency = 'USD', targetCurrency = 'KRW') => {
  try {
    // Using frankfurter.app for free exchange rates (no API key required)
    // Note: frankfurter only supports EUR as base for free in some endpoints, 
    // but likely works for major ones or we can cross-calculate.
    // Alternatively trying open.er-api.com which is very permissive.
    
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
    if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
    }
    const data = await response.json();
    return data.rates[targetCurrency];
  } catch (error) {
    console.error("Currency API Error, using fallback:", error);
    // Fallback rates (approximate) to ensure app doesn't crash
    const fallbackRates = {
        'USD': 1300,
        'EUR': 1400,
        'JPY': 9,
        'CNY': 180,
        'KRW': 1
    };
    
    if (baseCurrency === 'KRW') return 1;
    
    // Simple fallback logic
    if (fallbackRates[baseCurrency]) {
        return fallbackRates[baseCurrency];
    }
    
    return null; 
  }
};

/**
 * Formats a number as KRW currency string.
 * @param {number} amount 
 * @returns {string} e.g. "15,000원"
 */
export const formatKRW = (amount) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
};
