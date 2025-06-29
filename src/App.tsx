import { useState, useEffect } from 'react';
import './App.css';

interface Item {
  _id: string;
  name: string;
  type: string;
  details: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  photo: string;
}

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [filterValue, setFilterValue] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Fetch items when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/auth/user', { 
        credentials: 'include' 
      });
      const data = await response.json();
      
      if (data.authenticated) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/items');
      const data = await response.json();
      setItems(data);
      setFilteredItems(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

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

  const handleGoogleLogin = () => {
    // Redirect to Google OAuth
    window.location.href = 'http://localhost:5000/auth/google';
  };

  const handleLogout = () => {
    window.location.href = 'http://localhost:5000/auth/logout';
  };

  if (!isAuthenticated) {
    return (
      <div className="App">
        <div className="login-container">
          <h1>Local Data Lister</h1>
          <p>Please sign in to access the application</p>
          <button onClick={handleGoogleLogin} className="google-login-btn">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="app-header">
        <h1>Local Data Lister</h1>
        <div className="user-info">
          <img src={user?.photo} alt="Profile" className="profile-pic" />
          <span>Welcome, {user?.name}!</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="filter-container">
        <input 
          type="text" 
          placeholder="Filter by name or type..." 
          value={filterValue} 
          onChange={handleFilterChange}
        />
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
