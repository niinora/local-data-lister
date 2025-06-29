const API_BASE = 'http://localhost:5000/api';

class DataLister {
    constructor() {
        this.currentSort = { by: 'name', order: 'asc' };
        this.currentFilter = '';
        this.searchQuery = '';
        this.allItems = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadItems();
        this.loadTypes();
    }

    bindEvents() {
        // Search controls
        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase().trim();
            this.filterAndDisplayItems();
        });

        document.getElementById('clearSearch')?.addEventListener('click', () => {
            document.getElementById('searchInput').value = '';
            this.searchQuery = '';
            this.filterAndDisplayItems();
        });

        // Sort controls
        document.getElementById('sortBy')?.addEventListener('change', (e) => {
            this.currentSort.by = e.target.value;
            this.filterAndDisplayItems();
        });

        document.getElementById('sortOrder')?.addEventListener('click', () => {
            const btn = document.getElementById('sortOrder');
            const isDesc = btn.classList.contains('desc');
            
            if (isDesc) {
                btn.classList.remove('desc');
                btn.querySelector('.sort-text').textContent = 'Ascending';
                this.currentSort.order = 'asc';
            } else {
                btn.classList.add('desc');
                btn.querySelector('.sort-text').textContent = 'Descending';
                this.currentSort.order = 'desc';
            }
            
            this.filterAndDisplayItems();
        });

        // Filter controls
        document.getElementById('typeFilter')?.addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.filterAndDisplayItems();
        });

        // Form controls
        document.getElementById('toggleForm')?.addEventListener('click', () => {
            const form = document.getElementById('itemForm');
            form?.classList.toggle('hidden');
        });

        document.getElementById('cancelForm')?.addEventListener('click', () => {
            document.getElementById('itemForm')?.classList.add('hidden');
        });

        document.getElementById('itemForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addItem();
        });
    }

    async loadItems() {
        try {
            const response = await fetch(`${API_BASE}/items`);
            if (!response.ok) throw new Error('Failed to fetch items');
            
            this.allItems = await response.json();
            this.filterAndDisplayItems();
        } catch (error) {
            console.error('Failed to load items:', error);
            this.showError('Failed to load items: ' + error.message);
        }
    }

    async loadTypes() {
        try {
            const response = await fetch(`${API_BASE}/items`);
            if (!response.ok) throw new Error('Failed to fetch types');
            
            const items = await response.json();
            const types = [...new Set(items.map(item => item.type))].sort();
            
            const select = document.getElementById('typeFilter');
            if (select) {
                types.forEach(type => {
                    const option = document.createElement('option');
                    option.value = type;
                    option.textContent = type;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Failed to load types:', error);
        }
    }

    async addItem() {
        const name = document.getElementById('itemName')?.value.trim();
        const type = document.getElementById('itemType')?.value.trim();
        const details = document.getElementById('itemDetails')?.value.trim();

        if (!name || !type || !details) {
            this.showError('All fields are required');
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, type, details })
            });

            if (!response.ok) throw new Error('Failed to add item');

            document.getElementById('itemForm')?.classList.add('hidden');
            document.getElementById('itemForm')?.reset();
            this.loadItems();
            this.loadTypes();
        } catch (error) {
            this.showError('Failed to add item: ' + error.message);
        }
    }

    filterAndDisplayItems() {
        let filteredItems = [...this.allItems];

        // Apply search filter
        if (this.searchQuery) {
            filteredItems = filteredItems.filter(item => 
                item.name.toLowerCase().includes(this.searchQuery) ||
                item.type.toLowerCase().includes(this.searchQuery) ||
                item.details.toLowerCase().includes(this.searchQuery)
            );
        }

        // Apply type filter
        if (this.currentFilter) {
            filteredItems = filteredItems.filter(item => 
                item.type === this.currentFilter
            );
        }

        // Apply sorting
        filteredItems.sort((a, b) => {
            const aValue = a[this.currentSort.by] || '';
            const bValue = b[this.currentSort.by] || '';
            
            const comparison = aValue.localeCompare(bValue);
            return this.currentSort.order === 'desc' ? -comparison : comparison;
        });

        this.renderItems(filteredItems);
    }

    renderItems(items) {
        const container = document.getElementById('itemsList');
        if (!container) return;
        
        if (items.length === 0) {
            const noResultsMessage = this.searchQuery || this.currentFilter 
                ? 'No items match your search criteria' 
                : 'No items found';
            container.innerHTML = `<div class="no-items">${noResultsMessage}</div>`;
            return;
        }

        container.innerHTML = items.map(item => `
            <div class="item-card">
                <div class="item-name">${this.escapeHtml(item.name)}</div>
                <div class="item-type">${this.escapeHtml(item.type)}</div>
                <div class="item-details">${this.escapeHtml(item.details)}</div>
            </div>
        `).join('');
    }

    showError(message) {
        const errorEl = document.getElementById('error');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.remove('hidden');
        }
    }

    resetForm() {
        document.getElementById('itemName').value = '';
        document.getElementById('itemType').value = '';
        document.getElementById('itemDetails').value = '';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new DataLister();
});
