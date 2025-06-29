import { useState, useEffect } from 'react';
import './App.css';

interface Item {
  _id: string;
  name: string;
  type: string;
  details: string;
  createdAt?: string;
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
  const [token, setToken] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'pass' })
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Login response:', data);
        setToken(data.token);
        setIsAuthenticated(true);
        console.log('Token set:', data.token);
      } else {
        const errorData = await response.json();
        console.error('Login failed:', errorData);
        setError(`Login failed: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login error: Network or server issue');
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5000/api/items', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      console.log('Fetched data:', data);
      if (Array.isArray(data)) {
        setItems(data);
        setFilteredItems(data);
      } else {
        console.error('Data is not an array:', data);
        setItems([]);
        setFilteredItems([]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching data:', error);
      setError(`Fetch error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (newItem: { name: string; type: string; details: string }) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newItem)
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      console.log('Created item response:', data);
      if (data.success) {
        setItems(prevItems => [data.data, ...prevItems]);
        setFilteredItems(prevItems => [data.data, ...prevItems]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error creating item:', error);
      setError(`Create error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      login();
    } else if (token) {
      fetchItems();
    }
  }, [isAuthenticated, token]);

  const sortItems = (itemsToSort: Item[], field: SortField, order: SortOrder) => {
    if (field === 'none') return itemsToSort;
    return [...itemsToSort].sort((a, b) => {
      const aValue = a[field].toLowerCase();
      const bValue = b[field].toLowerCase();
      return order === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
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

  const handleCreateItem = () => {
    const newItem = {
      name: prompt('Enter item name:') || '',
      type: prompt('Enter item type:') || '',
      details: prompt('Enter item details:') || ''
    };
    if (newItem.name && newItem.type && newItem.details) {
      createItem(newItem);
    } else {
      setError('All fields are required to create an item');
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
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      <div className="filter-container">
        <input
          type="text"
          placeholder="Filter by name or type..."
          value={filterValue}
          onChange={handleFilterChange}
        />
        <button onClick={() => applyFilterAndSort()}>Filter</button>
      </div>
      <div className="controls-container">
        <div className="sort-buttons">
          <button onClick={() => handleSort('name')}>{getSortButtonText('name')}</button>
          <button onClick={() => handleSort('type')}>{getSortButtonText('type')}</button>
        </div>
        <button onClick={handleCreateItem}>Add New Item</button>
      </div>
      <div className="status-bar">
        <span>Showing {filteredItems.length} of {items.length} items</span>
      </div>
      <div className="items-container">
        {loading ? (
          <div>Loading items...</div>
        ) : filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <div key={item._id} className="item">
              <h2>{item.name}</h2>
              <p><strong>Type:</strong> {item.type}</p>
              <p>{item.details}</p>
              <p><small>Created: {item.createdAt}</small></p>
            </div>
          ))
        ) : (
          <div>
            {items.length === 0 ? 'No items found' : 'No matching items found'}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;