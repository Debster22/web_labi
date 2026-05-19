// API Base URL
const API_BASE_URL = 'http://localhost:3000';
const API_ITEMS_URL = `${API_BASE_URL}/items`;

// Generic fetch function with error handling
async function fetchAPI(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // For DELETE requests, return true on success
        if (options.method === 'DELETE') {
            return true;
        }

        const data = await response.json();
        
        // Log for debugging
        console.log('API Response:', data);
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Get all items with optional query parameters
async function getItems(params = {}) {
    // Простий запит без параметрів для початку
    const url = API_ITEMS_URL;
    console.log('Fetching items from:', url);
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('Отримані дані:', data);
        console.log('Тип даних:', Array.isArray(data) ? 'масив' : typeof data);
        console.log('Кількість елементів:', Array.isArray(data) ? data.length : 'не масив');
        
        // Якщо data - це масив (як у вашому випадку)
        if (Array.isArray(data)) {
            console.log('Знайдено масив з', data.length, 'елементів');
            return data;
        }
        
        // Якщо data - це об'єкт з полем items
        if (data.items && Array.isArray(data.items)) {
            console.log('Знайдено data.items з', data.items.length, 'елементів');
            return data.items;
        }
        
        // Якщо data - це об'єкт з іншим полем, яке містить масив
        for (let key in data) {
            if (Array.isArray(data[key])) {
                console.log(`Знайдено масив в полі ${key} з ${data[key].length} елементів`);
                return data[key];
            }
        }
        
        // Якщо нічого не знайшли
        console.warn('Не вдалося знайти масив в відповіді');
        return [];
        
    } catch (error) {
        console.error('Помилка завантаження:', error);
        return [];
    }
}

// Get single item by id
async function getItemById(id) {
    const response = await fetchAPI(`${API_ITEMS_URL}/${id}`);
    return response;
}

// Create new item
async function createItem(data) {
    console.log('Creating item:', data);
    const response = await fetchAPI(API_ITEMS_URL, {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return response;
}

// Update item (using PATCH)
async function updateItem(id, data) {
    console.log('Updating item:', id, data);
    const response = await fetchAPI(`${API_ITEMS_URL}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
    return response;
}

// Delete item
async function deleteItem(id) {
    console.log('Deleting item:', id);
    const response = await fetchAPI(`${API_ITEMS_URL}/${id}`, {
        method: 'DELETE',
    });
    return response;
}