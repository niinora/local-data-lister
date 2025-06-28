import { useState, useEffect } from 'react';
import './App.css';

interface Item {
  _id: string;
  name: string;
  type: string;
  details: string;
}

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [filterValue, setFilterValue] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('http://localhost:5000/api/items');
        const data = await response.json();
        setItems(data);
        setFilteredItems(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilterValue(value);
    
    if (!value.trim()) {
      setFilteredItems(items);
    } else {
      const searchTerm = value.toLowerCase().trim();
      const filtered = items.filter(item => 
        item.type.toLowerCase().includes(searchTerm) || 
        item.name.toLowerCase().includes(searchTerm)
      );
      setFilteredItems(filtered);
    }
  };

  const applyFilter = () => {
    if (!filterValue.trim()) {
      setFilteredItems(items);
    } else {
      const searchTerm = filterValue.toLowerCase().trim();
      const filtered = items.filter(item => 
        item.type.toLowerCase().includes(searchTerm) || 
        item.name.toLowerCase().includes(searchTerm)
      );
      setFilteredItems(filtered);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      applyFilter();
    }
  };

  return (
    <div className="App">
      <h1>Local Data Lister</h1>
      <div className="filter-container">
        <input 
          type="text" 
          placeholder="Filter by name or type..." 
          value={filterValue} 
          onChange={handleFilterChange}
          onKeyPress={handleKeyPress}
        />
        <button className="filter-button" onClick={applyFilter}>Filter</button>
      </div>

      <div className="items-container">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <div key={item._id} className="item">
              <h2>{item.name}</h2>
              <p><strong>Type:</strong> {item.type}</p>
              <p>{item.details}</p>
            </div>
          ))
        ) : (
          <div className="no-results">No matching items found</div>
        )}
      </div>
    </div>
  );
}

export default App;