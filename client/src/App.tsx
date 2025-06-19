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
      const response = await fetch('http://localhost:5000/api/items');
      const data = await response.json();
      setItems(data);
      setFilteredItems(data);
    }
    fetchData();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(e.target.value);
  };

  const applyFilter = () => {
    if (!filterValue.trim()) {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(item => 
        item.type.toLowerCase().includes(filterValue.toLowerCase())
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
        placeholder="Filter by type..." 
        value={filterValue} 
        onChange={handleFilterChange}
        onKeyPress={handleKeyPress}
      />
      <button className="filter-button" onClick={applyFilter}>Filter</button>
    </div>

    <div className="items-container">
      {filteredItems.map(item => (
        <div key={item._id} className="item">
          <h2>{item.name}</h2>
          <p><strong>Type:</strong> {item.type}</p>
          <p>{item.details}</p>
        </div>
      ))}
    </div>
  </div>
);
}

export default App;