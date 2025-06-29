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
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const login = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/login', {
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
      const response = await fetch(`/api/items${query}`, {
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
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log('Delete response:', data);
      if (response.ok && data.success) {
        console.log('Successfully deleted, updating state');
        setItems(prevItems => prevItems.filter(item => item._id !== itemId));
        setFilteredItems(prevItems => prevItems.filter(item => item._id !== itemId));
        setDeleteModal({ isOpen: false, itemId: '', itemName: '' });
        fetchItems();
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

  const openItemModal = (item: Item) => {
    setSelectedItem(item);
  };

  const closeItemModal = () => {
    setSelectedItem(null);
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
      {/* Header with just title and logout */}
      <header className="app-header">
        <h1>Local Data Lister</h1>
        <button 
          className="btn btn-secondary" 
          onClick={() => {
            setToken('');
            setIsAuthenticated(false);
            localStorage.removeItem('token');
          }}
        >
          Logout
        </button>
      </header>

      {error && (
        <div className="error">
          Error: {error}
        </div>
      )}

      {/* Controls row with filter, sort, and add item */}
      <div className="controls-row">
        <div className="filter-section">
          <input
            type="text"
            placeholder="Filter by name or type..."
            value={filterValue}
            onChange={handleFilterChange}
            className="filter-input"
          />
          <button className="filter-button" onClick={() => applyFilterAndSort()}>
            Filter
          </button>
        </div>
        
        <div className="action-buttons">
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
          <button 
            className="btn btn-primary add-item-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : '+ Add Item'}
          </button>
        </div>
      </div>

      {/* Conditionally show Add Item Form */}
      {showAddForm && (
        <AddItemForm onItemAdded={() => {
          fetchItems();
          setShowAddForm(false);
        }} token={token} setError={setError} />
      )}

      <div className="status-bar">
        <span>Showing {filteredItems.length} of {items.length} items</span>
      </div>

      <div className="items-container">
        {loading ? (
          <div className="no-results loading">Loading items...</div>
        ) : filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <div 
              key={item._id} 
              className="item"
              data-type={item.type}
              onClick={() => openItemModal(item)}
              style={{ cursor: 'pointer' }}
            >
              <h2>{item.name || 'Unnamed'}</h2>
              <p><strong>Type:</strong> {item.type || 'N/A'}</p>
              <p>{item.details || 'No details'}</p>
              <small>Created: {formatDate(item.createdAt)}</small>
            </div>
          ))
        ) : (
          <div className="no-results">
            {items.length === 0 ? 'No items found' : 'No matching items found'}
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={closeItemModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedItem.name || 'Unnamed'}</h2>
              <button 
                className="modal-close-btn"
                onClick={closeItemModal}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="item-detail-row">
                <strong>Type:</strong> {selectedItem.type || 'N/A'}
              </div>
              <div className="item-detail-row">
                <strong>Details:</strong> {selectedItem.details || 'No details'}
              </div>
              <div className="item-detail-row">
                <strong>Created:</strong> {formatDate(selectedItem.createdAt)}
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={closeItemModal}
              >
                Close
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => {
                  closeItemModal();
                  openDeleteModal(selectedItem._id, selectedItem.name || 'Unnamed');
                }}
              >
                Delete Item
              </button>
            </div>
          </div>
        </div>
      )}

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