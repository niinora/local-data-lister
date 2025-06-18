import { useState } from 'react';
import './App.css';

function App() {
  const [filter, setFilter] = useState('');

  return (
    <div>
      <input
        type="text"
        value={filter}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)}
        placeholder="Filter by type"
      />
      <h1>Local Data Lister</h1>
    </div>
  );
}

export default App;