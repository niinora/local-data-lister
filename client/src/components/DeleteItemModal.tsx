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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Confirm Deletion</h2>
          <button
            className="modal-close-btn"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          <p>Are you sure you want to delete "{itemName}"? This action cannot be undone.</p>
        </div>
        <div className="modal-actions">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteItemModal;