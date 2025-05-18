import axios from 'axios'

const API_URL = 'https://db.ygoprodeck.com/api/v7';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const getDataWithCache = async (cacheKey, apiCall) => {
  const cachedData = localStorage.getItem(cacheKey);
  
  if (cachedData) {
    try {
      const parsedCache = JSON.parse(cachedData);
      const now = new Date().getTime();
      
      if (now - parsedCache.timestamp < CACHE_EXPIRY) {
        console.log(`Using cached data for ${cacheKey}`);
        return parsedCache.data;
      }
    } catch (e) {
      console.error('Error parsing cache:', e);
    }
  }
  
  try {
    console.log(`Fetching fresh data for ${cacheKey}`);
    const data = await apiCall();
    
    localStorage.setItem(cacheKey, JSON.stringify({
      timestamp: new Date().getTime(),
      data
    }));
    
    return data;
  } catch (error) {
    console.error(`Error fetching data for ${cacheKey}:`, error);
    throw error;
  }
};


// This fetches all cards /cardinfo.php
export const fetchCards = async (params = {}) => {
    const apiParams = { ...params };
    
    if (apiParams.num && !apiParams.offset) {
      apiParams.offset = 0;
    }
    
    const cacheKey = `ygo_cards_${JSON.stringify(apiParams)}`;
  
    return getDataWithCache(cacheKey, async () => {
      try {
        const response = await axios.get(`${API_URL}/cardinfo.php`, { params: apiParams });
        return response.data;
      } catch (error) {
        console.error('Error fetching cards:', error);
        throw error;
      }
    });
  };
  

// Fetches card by Name
export const searchCardByName = async (cardName) => {
    const cacheKey = `ygo_search_${cardName}`;
    
    return getDataWithCache(cacheKey, async () => {
      try {
        const response = await axios.get(`${API_URL}/cardinfo.php`, {
          params: { fname: cardName }
        });
        return response.data;
      } catch (error) {
        console.error('Error searching card by name:', error);
        throw error;
      }
    });
  };

  export const clearCardCache = () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('ygo_')) {
        localStorage.removeItem(key);
      }
    });
    console.log('Card cache cleared');
  };