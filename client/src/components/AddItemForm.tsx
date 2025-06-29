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

  const apiUrl = 'http://localhost:5000/api';

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
      const response = await fetch(`${apiUrl}/items`, {
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
    <form className="filter-container" style={{ background: 'var(--bg-primary)', marginBottom: '2rem' }} onSubmit={handleSubmit}>
      <h2 className="app-title">Add New Item</h2>
      {success && <div className="status-bar" style={{ background: 'var(--success-gradient)' }}>{success}</div>}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="name" className="block text-sm font-semibold text-[var(--text-primary)]">Name</label>
        <input
          type="text"
          id="name"
          placeholder="Enter item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full"
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="type" className="block text-sm font-semibold text-[var(--text-primary)]">Type</label>
        <input
          type="text"
          id="type"
          placeholder="Enter item type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
          className="w-full"
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="details" className="block text-sm font-semibold text-[var(--text-primary)]">Details</label>
        <textarea
          id="details"
          placeholder="Enter item details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          required
          className="w-full"
          style={{ minHeight: '80px' }}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="filter-button"
        style={{ width: '100%' }}
      >
        {loading ? 'Adding...' : 'Add Item'}
      </button>
    </form>
  );
};

export default AddItemForm;