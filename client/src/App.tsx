import { useState, useEffect } from 'react';
import './App.css';

interface Item {
  _id: string;
  name: string;
  type: string;
  details: string;
}

type SortField = 'name' | 'type' | 'none';
type SortOrder = 'asc' | 'desc';

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [filterValue, setFilterValue] = useState('');
  const [sortField, setSortField] = useState<SortField>('none');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

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
    
    // If clicking the same field, toggle order
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
          <div className="no-results">
            {items.length === 0 ? 'Loading items...' : 'No matching items found'}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;