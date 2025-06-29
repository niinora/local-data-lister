import { useState, useEffect } from 'react';
import './App.css';

interface Item {
  id: string;
  name: string;
  type: string;
  details: string;
  location?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  rating?: number;
  priceRange?: string;
  hours?: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  tags?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

type SortField = 'name' | 'type' | 'none';
type SortOrder = 'asc' | 'desc';

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [filterValue, setFilterValue] = useState('');
  const [sortField, setSortField] = useState<SortField>('none');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string>(localStorage.getItem('token') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDetails, setShowDetails] = useState(false); // NEW: Toggle for details

  // Replace with your Render backend URL after deployment
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  const login = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl.replace('/api', '')}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'pass' })
      });
      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        localStorage.setItem('token', data.token); // Store token in localStorage
        setIsAuthenticated(true);
        console.log('Login successful, token:', data.token);
      } else {
        console.error('Login failed:', await response.json());
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if we have a token from localStorage
    if (token) {
      setIsAuthenticated(true);
    } else if (!isAuthenticated) {
      login(); // Auto-login on mount if no token
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && token) {
      async function fetchData() {
        try {
          setLoading(true);
          const response = await fetch(`${apiUrl}/items`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          console.log('Fetched data:', data);
          const itemsData = data.data || data;
          if (Array.isArray(itemsData)) {
            setItems(itemsData);
            setFilteredItems(itemsData);
          } else {
            console.error('Data is not an array:', itemsData);
            setItems([]);
            setFilteredItems([]);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      }
      fetchData();
    }
  }, [isAuthenticated, token, apiUrl]);

  const sortItems = (itemsToSort: Item[], field: SortField, order: SortOrder) => {
    if (field === 'none') return itemsToSort;

    return [...itemsToSort].sort((a, b) => {
      const aValue = a[field].toLowerCase();
      const bValue = b[field].toLowerCase();
      
      if (order === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  };

  const applyFilterAndSort = (searchValue?: string) => {
    const searchTerm = (searchValue ?? filterValue).toLowerCase().trim();
    
    let filtered = items;
    if (searchTerm) {
      filtered = items.filter(item => 
        item.type.toLowerCase().includes(searchTerm) || 
        item.name.toLowerCase().includes(searchTerm)
      );
    }

    const sorted = sortItems(filtered, sortField, sortOrder);
    setFilteredItems(sorted);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilterValue(value);
    applyFilterAndSort(value);
  };

  const applyFilter = () => {
    applyFilterAndSort();
  };

  const handleSort = (field: SortField) => {
    let newOrder: SortOrder = 'asc';
    
    if (field === sortField) {
      newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    }
    
    setSortField(field);
    setSortOrder(newOrder);
    
    const sorted = sortItems(filteredItems, field, newOrder);
    setFilteredItems(sorted);
  };

  const clearFiltersAndSort = () => {
    setFilterValue('');
    setSortField('none');
    setSortOrder('asc');
    setFilteredItems(items);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      applyFilter();
    }
  };

  const getSortButtonText = (field: SortField) => {
    if (sortField === field) {
      return `Sort by ${field} ${sortOrder === 'asc' ? '↑' : '↓'}`;
    }
    return `Sort by ${field}`;
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

      <div className="controls-container">
        <div className="sort-buttons">
          <button 
            className={`sort-button ${sortField === 'name' ? 'active' : ''}`}
            onClick={() => handleSort('name')}
          >
            {getSortButtonText('name')}
          </button>
          <button 
            className={`sort-button ${sortField === 'type' ? 'active' : ''}`}
            onClick={() => handleSort('type')}
          >
            {getSortButtonText('type')}
          </button>
        </div>
        
        {/* NEW: Details Toggle Button */}
        <button 
          className="details-toggle-button" 
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
        
        <button className="clear-button" onClick={clearFiltersAndSort}>
          Clear All
        </button>
      </div>

      <div className="status-bar">
        <span>Showing {filteredItems.length} of {items.length} items</span>
        {(filterValue || sortField !== 'none') && (
          <span className="active-filters">
            {filterValue && ` • Filtered: "${filterValue}"`}
            {sortField !== 'none' && ` • Sorted by ${sortField} (${sortOrder})`}
          </span>
        )}
        {/* NEW: Show details status */}
        <span className="details-status">
          • Details: {showDetails ? 'Shown' : 'Hidden'}
        </span>
      </div>

      <div className="items-container">
        {loading ? (
          <div className="no-results">Loading items...</div>
        ) : filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <div key={item.id} className="item">
              <h2>{item.name}</h2>
              <p><strong>Type:</strong> {item.type}</p>
              {/* NEW: Conditional details display */}
              {showDetails && <p><strong>Details:</strong> {item.details}</p>}
            </div>
          ))
        ) : (
          <div className="no-results">
            {items.length === 0 ? 'No items found' : 'No matching items found'}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;