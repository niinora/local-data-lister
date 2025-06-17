import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000); // Simulate API call
  }, []);

  return (
    <div>
      {loading ? <h1>Loading...</h1> : <h1>Local Data Lister</h1>}
    </div>
  );
}

export default App;