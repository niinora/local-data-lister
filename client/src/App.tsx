import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000); // Simulate API call
  }, []);

  return (
    <div>
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter by type"
      />
      {loading ? <h1>Loading...</h1> : <h1>Local Data Lister</h1>}
    </div>
  );
}

export default App;