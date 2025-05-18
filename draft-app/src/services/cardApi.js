import axios from 'axios'

const API_URL = 'https://db.ygoprodeck.com/api/v7';

// This fetches all cards /cardinfo.php
export const fetchCards = async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/cardinfo.php`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching cards:', error);
      throw error;
    }
  };

// Fetches card by Name
export const searchCardByName = async (cardName)=>{
    try{
        const response = await axios.get(`${API_URL}/cardinfo.php`,{
            params: {fname: cardName}
        })
        return response.data;
    } catch (error){
        console.error('Error searching card by name:', error);
        throw error;
    }
}