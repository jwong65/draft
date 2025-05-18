import React, {useState, useEffect} from 'react'
import { fetchCards, searchCardByName, clearCardCache } from '../services/cardApi'

export default function Test() {
    const [cards, setCards] = useState([])
    const [searchResults, setSearchResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [searchLoading, setSearchLoading] = useState(false)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [cacheInfo, setCacheInfo] = useState({})

    useEffect(()=>{
        updateCacheInfo();
    }, [])

    const updateCacheInfo = () => {
        const info = {}
        const cardsCache = localStorage.getItem('ygo_cards_{"offset":0,"num":10}');
        if (cardsCache) {
          const parsed = JSON.parse(cardsCache);
          info.cardsCache = {
            timestamp: new Date(parsed.timestamp).toLocaleString(),
            cardCount: parsed.data.data?.length || 0
          };
        }
        let cacheCount = 0;
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('ygo_')) {
            cacheCount++;
          }
        });
        info.totalCacheEntries = cacheCount;
      
        setCacheInfo(info);
    }

    const handleFetchCards = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use both offset and num for proper pagination
        const result = await fetchCards({ offset: 0, num: 10 });
        setCards(result.data || []);
        
        updateCacheInfo();
        setLoading(false);
      } catch (err) {
        console.error('Error fetching cards:', err);
        setError('Failed to fetch cards. See console for details.');
        setLoading(false);
      }
    };

    const handleSearch = async (e) => {
      e.preventDefault();
      if (!searchTerm.trim()) return;
      
      try {
        setSearchLoading(true);
        setError(null);
        
        const result = await searchCardByName(searchTerm);
        setSearchResults(result.data || []);
        
        updateCacheInfo();
        setSearchLoading(false);
      } catch (err) {
        console.error('Error searching cards:', err);
        setError('Failed to search cards. See console for details.');
        setSearchLoading(false);
      }
    };

    const handleClearCache = () => {
      clearCardCache();
      setCards([]);
      setSearchResults([]);
      updateCacheInfo();
    };

    // Card display component for reuse
    const CardDisplay = ({ card }) => (
      <div style={{ 
        border: '1px solid #ddd', 
        borderRadius: '8px', 
        padding: '10px', 
        margin: '10px', 
        width: '200px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {card.card_images && card.card_images[0] && (
          <img 
            src={card.card_images[0].image_url} 
            alt={card.name} 
            style={{ width: '100%', borderRadius: '4px' }} 
          />
        )}
        <h4 style={{ marginTop: '10px', marginBottom: '5px' }}>{card.name}</h4>
        <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>{card.type}</p>
        {card.atk !== undefined && (
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            ATK: {card.atk} / DEF: {card.def}
          </p>
        )}
      </div>
    );

    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          <h1>YGO API Test</h1>
          
          {/* Cache Info */}
          <div style={{ 
            marginBottom: '20px', 
            padding: '15px', 
            backgroundColor: '#f5f5f5', 
            borderRadius: '8px' 
          }}>
              <h3>Cache Info</h3>
              <p>Cache entries: {cacheInfo.totalCacheEntries || 0}</p>
              {cacheInfo.cardsCache && (
                  <p>Cards cache: {cacheInfo.cardsCache.cardCount} cards, updated {cacheInfo.cardsCache.timestamp}</p>
              )}
              <button 
                onClick={handleClearCache}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ff4d4d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Clear Cache
              </button>
          </div>
          
          {/* Fetch Cards */}
          <div style={{ marginBottom: '30px' }}>
              <h3>Test fetchCards()</h3>
              <button 
                onClick={handleFetchCards} 
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Loading...' : 'Fetch 10 Cards'}
              </button>
              
              {cards.length > 0 && (
                <>
                  <p>Fetched {cards.length} cards</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {cards.map(card => (
                      <CardDisplay key={card.id} card={card} />
                    ))}
                  </div>
                </>
              )}
          </div>
          
          {/* Search Cards */}
          <div>
              <h3>Test searchCardByName()</h3>
              <form 
                onSubmit={handleSearch}
                style={{ marginBottom: '15px', display: 'flex' }}
              >
                  <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Enter card name"
                      style={{
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        marginRight: '10px',
                        flexGrow: 1,
                        maxWidth: '300px'
                      }}
                  />
                  <button 
                    type="submit" 
                    disabled={searchLoading}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: searchLoading ? 'not-allowed' : 'pointer',
                      opacity: searchLoading ? 0.7 : 1
                    }}
                  >
                    {searchLoading ? 'Searching...' : 'Search'}
                  </button>
              </form>
              
              {searchResults.length > 0 && (
                <>
                  <p>Found {searchResults.length} cards matching "{searchTerm}"</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {searchResults.map(card => (
                      <CardDisplay key={card.id} card={card} />
                    ))}
                  </div>
                </>
              )}
              
              {searchTerm && searchResults.length === 0 && !searchLoading && (
                <p>No cards found matching "{searchTerm}"</p>
              )}
          </div>
          
          {/* Error Display */}
          {error && (
            <div style={{ 
              color: 'white', 
              backgroundColor: '#f44336', 
              padding: '15px', 
              borderRadius: '4px',
              marginTop: '20px'
            }}>
              {error}
            </div>
          )}
      </div>
    )
}
