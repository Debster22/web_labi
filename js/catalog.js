// Catalog JavaScript with CRUD operations

// DOM Elements
const catalogGrid = document.getElementById('catalogGrid');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const statusFilter = document.getElementById('statusFilter');
const sortSelect = document.getElementById('sortSelect');
const addItemBtn = document.getElementById('addItemBtn');
const retryLoadBtn = document.getElementById('retryLoadBtn');
const paginationWrapper = document.getElementById('paginationWrapper');
const pagination = document.getElementById('pagination');

// Modal Elements
const deleteModal = document.getElementById('deleteModal');
const itemFormModal = document.getElementById('itemFormModal');
const deleteItemTitleSpan = document.getElementById('deleteItemTitle');
let currentDeleteId = null;
let currentEditItem = null;

// State
let currentItems = [];
let currentFilters = {
    search: '',
    category: 'all',
    status: 'all',
    sortBy: 'id',
    order: 'asc',
    page: 1,
    limit: 100  // Збільшено щоб бачити всі елементи
};
let totalItems = 0;

// ========================================
// Render Functions
// ========================================
function renderCatalog(items) {
    if (!catalogGrid) return;
    
    console.log('renderCatalog отримав:', items);
    console.log('Чи масив?', Array.isArray(items));
    
    if (!items || !Array.isArray(items) || items.length === 0) {
        catalogGrid.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        if (paginationWrapper) paginationWrapper.style.display = 'none';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    if (paginationWrapper) paginationWrapper.style.display = 'block';
    
    catalogGrid.innerHTML = items.map(item => `
        <div class="project-card" data-id="${item.id}">
            <div class="project-image">
                <img src="${item.image || 'https://picsum.photos/id/100/400/300'}" alt="${escapeHtml(item.title)}" loading="lazy">
                <span class="project-badge ${item.status}">${item.status === 'published' ? 'Опубліковано' : 'Чернетка'}</span>
            </div>
            <div class="project-content">
                <h3 class="project-title">${escapeHtml(item.title)}</h3>
                <span class="project-category">${getCategoryName(item.category)}</span>
                <p class="project-description">${escapeHtml(item.description.substring(0, 100))}${item.description.length > 100 ? '...' : ''}</p>
                <div class="project-price">$${item.price.toLocaleString()}</div>
                <div class="project-tags">
                    ${item.tags && Array.isArray(item.tags) ? item.tags.map(tag => `<span class="project-tag">${escapeHtml(tag)}</span>`).join('') : ''}
                </div>
                <div class="project-actions">
                    <button class="btn-edit" onclick="window.editItem(${typeof item.id === 'string' ? `'${item.id}'` : item.id})"><i class="fas fa-edit"></i> Редагувати</button>
                    <button class="btn-delete" onclick="window.deleteItemHandler(${typeof item.id === 'string' ? `'${item.id}'` : item.id}, '${escapeHtml(item.title)}')"><i class="fas fa-trash"></i> Видалити</button>
                </div>
            </div>
        </div>
    `).join('');
    
    console.log('Відображено', items.length, 'проєктів');
}

function getCategoryName(category) {
    const categories = {
        'web': 'Веб-розробка',
        'mobile': 'Мобільна розробка',
        'ai': 'AI рішення'
    };
    return categories[category] || category;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// Load Items
// ========================================
async function loadItems() {
    if (!catalogGrid) return;
    
    // Show loading state
    if (loadingState) loadingState.style.display = 'block';
    if (catalogGrid) catalogGrid.style.display = 'none';
    if (errorState) errorState.style.display = 'none';
    if (emptyState) emptyState.style.display = 'none';
    
    try {
        // Get all items without filters first for testing
        const items = await getItems();
        
        console.log('loadItems отримав:', items);
        
        currentItems = items;
        totalItems = items.length;
        
        if (loadingState) loadingState.style.display = 'none';
        if (catalogGrid) catalogGrid.style.display = 'grid';
        
        renderCatalog(currentItems);
        showToast(`Завантажено ${items.length} проєктів`);
        
    } catch (error) {
        console.error('Error loading items:', error);
        if (loadingState) loadingState.style.display = 'none';
        if (errorState) errorState.style.display = 'block';
        showToast('Помилка завантаження даних', true);
    }
}

// ========================================
// Delete Item
// ========================================
window.deleteItemHandler = (id, title) => {
    currentDeleteId = id;
    if (deleteItemTitleSpan) deleteItemTitleSpan.textContent = title;
    if (deleteModal) deleteModal.classList.add('active');
};

async function confirmDelete() {
    if (!currentDeleteId) return;
    
    try {
        await deleteItem(currentDeleteId);
        closeDeleteModal();
        showToast('Проєкт успішно видалено');
        await loadItems();
    } catch (error) {
        console.error('Error deleting item:', error);
        showToast('Помилка при видаленні', true);
    }
}

function closeDeleteModal() {
    if (deleteModal) deleteModal.classList.remove('active');
    currentDeleteId = null;
}

// ========================================
// Edit Item
// ========================================
window.editItem = async (id) => {
    try {
        const item = await getItemById(id);
        currentEditItem = item;
        openItemForm('edit', item);
    } catch (error) {
        console.error('Error loading item:', error);
        showToast('Помилка завантаження даних проєкту', true);
    }
};

// ========================================
// Add/Edit Item Form
// ========================================
function openAddItemForm() {
    currentEditItem = null;
    openItemForm('add');
}

function openItemForm(mode, item = null) {
    if (!itemFormModal) return;
    
    const formTitle = document.getElementById('itemFormTitle');
    const formSubmit = document.getElementById('itemFormSubmit');
    const itemId = document.getElementById('itemId');
    const titleInput = document.getElementById('itemTitle');
    const categorySelect = document.getElementById('itemCategory');
    const statusSelect = document.getElementById('itemStatus');
    const priceInput = document.getElementById('itemPrice');
    const descTextarea = document.getElementById('itemDescription');
    const imageInput = document.getElementById('itemImage');
    const tagsInput = document.getElementById('itemTags');
    
    if (mode === 'edit' && item) {
        formTitle.textContent = 'Редагувати проєкт';
        formSubmit.textContent = 'Оновити';
        itemId.value = item.id;
        titleInput.value = item.title;
        categorySelect.value = item.category;
        statusSelect.value = item.status;
        priceInput.value = item.price;
        descTextarea.value = item.description;
        imageInput.value = item.image || '';
        tagsInput.value = item.tags ? item.tags.join(', ') : '';
    } else {
        formTitle.textContent = 'Додати проєкт';
        formSubmit.textContent = 'Створити';
        itemId.value = '';
        titleInput.value = '';
        categorySelect.value = 'web';
        statusSelect.value = 'published';
        priceInput.value = '';
        descTextarea.value = '';
        imageInput.value = '';
        tagsInput.value = '';
    }
    
    // Clear errors
    document.querySelectorAll('#itemForm .error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('#itemForm input, #itemForm select, #itemForm textarea').forEach(el => {
        el.classList.remove('error');
    });
    
    itemFormModal.classList.add('active');
}

async function saveItemForm(event) {
    event.preventDefault();
    
    // Get form values
    const id = document.getElementById('itemId').value;
    const title = document.getElementById('itemTitle').value.trim();
    const category = document.getElementById('itemCategory').value;
    const status = document.getElementById('itemStatus').value;
    const price = parseFloat(document.getElementById('itemPrice').value);
    const description = document.getElementById('itemDescription').value.trim();
    const image = document.getElementById('itemImage').value.trim();
    const tagsStr = document.getElementById('itemTags').value.trim();
    
    // Validation
    if (!title || title.length < 3) {
        showToast('Назва повинна містити щонайменше 3 символи', true);
        return;
    }
    
    if (isNaN(price) || price < 0) {
        showToast('Введіть коректну ціну', true);
        return;
    }
    
    if (!description || description.length < 10) {
        showToast('Опис повинен містити щонайменше 10 символів', true);
        return;
    }
    
    const itemData = {
        title,
        category,
        status,
        price,
        description,
        image: image || `https://picsum.photos/id/${Math.floor(Math.random() * 100)}/400/300`,
        tags: tagsStr ? tagsStr.split(',').map(t => t.trim()) : []
    };
    
    try {
        if (id) {
            await updateItem(id, itemData);
            showToast('Проєкт успішно оновлено');
        } else {
            await createItem(itemData);
            showToast('Проєкт успішно створено');
        }
        closeItemForm();
        await loadItems();
    } catch (error) {
        console.error('Error saving item:', error);
        showToast('Помилка при збереженні', true);
    }
}

function closeItemForm() {
    if (itemFormModal) itemFormModal.classList.remove('active');
}

// ========================================
// Toast Notification
// ========================================
function showToast(message, isError = false) {
    let toast = document.getElementById('toastNotification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toastNotification';
        toast.className = 'toast-notification';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.classList.add('show');
    if (isError) toast.classList.add('error');
    
    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.remove('error');
    }, 3000);
}

// ========================================
// Initialize Catalog Page
// ========================================
function initCatalogPage() {
    if (!catalogGrid) {
        console.log('Catalog grid not found on this page');
        return;
    }
    
    console.log('Initializing catalog page...');
    
    // Initialize event listeners
    if (addItemBtn) {
        addItemBtn.addEventListener('click', openAddItemForm);
    }
    
    if (retryLoadBtn) {
        retryLoadBtn.addEventListener('click', loadItems);
    }
    
    // Modal close buttons
    document.querySelectorAll('.modal-close, .form-modal-cancel, .delete-modal-cancel').forEach(btn => {
        btn.addEventListener('click', () => {
            closeItemForm();
            closeDeleteModal();
        });
    });
    
    const confirmDeleteBtn = document.querySelector('.delete-modal-confirm');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', confirmDelete);
    }
    
    const itemForm = document.getElementById('itemForm');
    if (itemForm) {
        itemForm.addEventListener('submit', saveItemForm);
    }
    
    // Close modals on overlay click
    window.addEventListener('click', (e) => {
        if (e.target === deleteModal) closeDeleteModal();
        if (e.target === itemFormModal) closeItemForm();
    });
    
    // Description character counter
    const descTextarea = document.getElementById('itemDescription');
    const descCharCount = document.getElementById('descCharCount');
    if (descTextarea && descCharCount) {
        descTextarea.addEventListener('input', () => {
            descCharCount.textContent = descTextarea.value.length;
        });
    }
    
    // Load initial items
    loadItems();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCatalogPage);
} else {
    initCatalogPage();
}