import React from 'react';

interface DeleteItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  loading: boolean;
}

const DeleteItemModal: React.FC<DeleteItemModalProps> = ({ isOpen, onClose, onConfirm, itemName, loading }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <div className="item" style={{ maxWidth: '400px', width: '90%', padding: '20px' }}>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Confirm Deletion</h2>
        <p className="text-[var(--text-secondary)] mb-4">
          Are you sure you want to delete "{itemName}"? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            className="sort-button"
            onClick={onClose}
            disabled={loading}
            style={{ background: 'var(--bg-accent)', color: 'var(--text-primary)' }}
          >
            Cancel
          </button>
          <button
            className="filter-button"
            onClick={onConfirm}
            disabled={loading}
            style={{ background: '#e53e3e' }}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteItemModal;