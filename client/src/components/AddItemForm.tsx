import React, { useState } from 'react';

     interface AddItemFormProps {
       onItemAdded: () => void;
       token: string;
     }

     const AddItemForm: React.FC<AddItemFormProps> = ({ onItemAdded, token }) => {
       const [name, setName] = useState('');
       const [type, setType] = useState('');
       const [details, setDetails] = useState('');
       const [loading, setLoading] = useState(false);
       const [error, setError] = useState<string | null>(null);

       const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

       const handleSubmit = async (e: React.FormEvent) => {
         e.preventDefault();
         setLoading(true);
         setError(null);

         try {
           const response = await fetch(`${apiUrl}/items`, {
             method: 'POST',
             headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
             },
             body: JSON.stringify({ name, type, details })
           });

           if (response.ok) {
             setName('');
             setType('');
             setDetails('');
             onItemAdded();
             alert('Item added successfully!');
           } else {
             const errorData = await response.json();
             setError(`Failed to add item: ${errorData.message || response.statusText}`);
           }
         } catch (error) {
           console.error('Error adding item:', error);
           setError('Error adding item: Network or server issue');
         } finally {
           setLoading(false);
         }
       };

       return (
         <form onSubmit={handleSubmit} className="add-item-form">
           <h2>Add New Item</h2>
           {error && <div style={{ color: 'red' }}>{error}</div>}
           <input
             type="text"
             placeholder="Name"
             value={name}
             onChange={(e) => setName(e.target.value)}
             required
           />
           <input
             type="text"
             placeholder="Type"
             value={type}
             onChange={(e) => setType(e.target.value)}
             required
           />
           <textarea
             placeholder="Details"
             value={details}
             onChange={(e) => setDetails(e.target.value)}
             required
           />
           <button type="submit" disabled={loading}>
             {loading ? 'Adding...' : 'Add Item'}
           </button>
         </form>
       );
     };

     export default AddItemForm;