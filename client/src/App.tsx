import { useState, useEffect } from 'react';
import AddItemForm from './components/AddItemForm';
import DeleteItemModal from './components/DeleteItemModal';
import LoginPage from './components/LoginPage';
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
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; itemId: string; itemName: string }>({
    isOpen: false,
    itemId: '',
    itemName: '',
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const login = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      console.log('Login response:', data);
      if (response.ok && data.token) {
        setToken(data.token);
        setIsAuthenticated(true);
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Login error: ${errorMessage}. Ensure the backend server is running at http://localhost:5000.`);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    if (!token) {
      setError('No authentication token. Please log in.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching items with token:', token);
      const query = sortField !== 'none' ? `?sortBy=${sortField}&sortOrder=${sortOrder}` : '';
      const response = await fetch(`http://localhost:5000/api/items${query}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      console.log('Fetch response status:', response.status);
      const data = await response.json();
      console.log('Fetch response data:', data);
      if (response.ok && Array.isArray(data)) {
        setItems(data);
        setFilteredItems(data);
      } else {
        setError(`Failed to fetch items: ${data.message || response.statusText}`);
        setItems([]);
        setFilteredItems([]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Fetch error: ${errorMessage}`);
      setItems([]);
      setFilteredItems([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (itemId: string) => {
    console.log('Attempting to delete item with ID:', itemId);
    try {
      setDeleteLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:5000/api/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log('Delete response:', data);
      if (response.ok && data.success) {
        console.log('Removing item from state:', itemId);
        setItems(prevItems => {
          const newItems = prevItems.filter(item => item._id !== itemId);
          console.log('New items state:', newItems);
          return newItems;
        });
        setFilteredItems(prevItems => {
          const newFiltered = prevItems.filter(item => item._id !== itemId);
          console.log('New filtered items state:', newFiltered);
          return newFiltered;
        });
        setDeleteModal({ isOpen: false, itemId: '', itemName: '' });
      } else {
        setError(`Failed to delete item: ${data.message || response.statusText}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Delete error: ${errorMessage}`);
      console.error('Delete error details:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const applyFilterAndSort = (searchValue?: string) => {
    const searchTerm = (searchValue ?? filterValue).toLowerCase().trim();
    let filtered = items;
    if (searchTerm) {
      filtered = items.filter(item =>
        (item.name?.toLowerCase().includes(searchTerm) || item.type?.toLowerCase().includes(searchTerm))
      );
    }
    const sorted = sortItems(filtered, sortField, sortOrder);
    setFilteredItems(sorted);
    console.log('Filtered and sorted items:', sorted);
  };

  const sortItems = (itemsToSort: Item[], field: SortField, order: SortOrder) => {
    if (field === 'none') return itemsToSort;
    return [...itemsToSort].sort((a, b) => {
      const aValue = a[field]?.toLowerCase() || '';
      const bValue = b[field]?.toLowerCase() || '';
      return order === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilterValue(value);
    applyFilterAndSort(value);
  };

  const handleSort = (field: SortField) => {
    const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newOrder);
    fetchItems();
  };

  const formatDate = (isoString: string | undefined) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSortButtonText = (field: SortField) => {
    if (sortField === field) {
      return `Sort by ${field} ${sortOrder === 'asc' ? '↑' : '↓'}`;
    }
    return `Sort by ${field}`;
  };

  const openDeleteModal = (itemId: string, itemName: string) => {
    console.log('Opening delete modal for item:', itemId, itemName);
    setDeleteModal({ isOpen: true, itemId, itemName });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, itemId: '', itemName: '' });
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchItems();
    }
  }, [isAuthenticated, token]);

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <div className="App">
      <h1>Local Data Lister</h1>
      {error && (
        <div className="no-results" style={{ color: 'var(--text-primary)', background: '#ffe5e5' }}>
          Error: {error}
        </div>
      )}
      <AddItemForm onItemAdded={fetchItems} token={token} setError={setError} />
      <div className="filter-container">
        <input
          type="text"
          placeholder="Filter by name or type..."
          value={filterValue}
          onChange={handleFilterChange}
        />
        <button className="filter-button" onClick={() => applyFilterAndSort()}>
          Filter
        </button>
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
      </div>
      <div className="status-bar">
        <span>Showing {filteredItems.length} of {items.length} items</span>
      </div>
      <div className="items-container">
        {loading ? (
          <div className="no-results loading">Loading items...</div>
        ) : filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <div key={item._id} className="item">
              <div className="flex justify-between items-start">
                <h2>{item.name || 'Unnamed'}</h2>
                <button
                  className="sort-button"
                  style={{ background: '#e53e3e', color: 'white', padding: '6px 12px' }}
                  onClick={() => openDeleteModal(item._id, item.name || 'Unnamed')}
                >
                  Delete
                </button>
              </div>
              <p><strong>Type:</strong> {item.type || 'N/A'}</p>
              <p>{item.details || 'No details'}</p>
              <p><small>Created: {formatDate(item.createdAt)}</small></p>
            </div>
          ))
        ) : (
          <div className="no-results">
            {items.length === 0 ? 'No items found' : 'No matching items found'}
          </div>
        )}
      </div>
      <DeleteItemModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => deleteItem(deleteModal.itemId)}
        itemName={deleteModal.itemName}
        loading={deleteLoading}
      />
    </div>
  );
}

export default App;