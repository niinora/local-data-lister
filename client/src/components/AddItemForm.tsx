import React, { useState } from 'react';

interface AddItemFormProps {
  onItemAdded: () => void;
  token: string;
  setError: (error: string | null) => void;
}

const AddItemForm: React.FC<AddItemFormProps> = ({ onItemAdded, token, setError }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Authentication required. Please refresh the page.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, type, details }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setName('');
        setType('');
        setDetails('');
        setSuccess('Item added successfully!');
        onItemAdded();
      } else {
        setError(`Failed to add item: ${data.message || response.statusText}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Error adding item: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="item-form">
      <h2>Add New Item</h2>
      {success && <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{success}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Enter item type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        />
        <textarea
          placeholder="Enter item details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%' }}
        >
          {loading ? 'Adding...' : 'Add Item'}
        </button>
      </form>
    </div>
  );
};

export default AddItemForm;