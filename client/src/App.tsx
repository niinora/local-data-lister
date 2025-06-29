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

useEffect(() => {
  if (!isAuthenticated) {
    login();
  } else if (token) {
    console.log('Fetching with token:', token);
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:5000/api/items', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
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
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Error fetching data:', error);
        setError(`Fetch error: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
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
           {error && <div style={{ color: 'red' }}>Error: {error}</div>}
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
             {loading ? (
               <div className="no-results">Loading items...</div>
             ) : filteredItems.length > 0 ? (
               filteredItems.map(item => (
                 <div key={item.id} className="item">
                   <h2>{item.name}</h2>
                   <p><strong>Type:</strong> {item.type}</p>
                   <p>{item.details}</p>
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