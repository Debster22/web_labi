// Contact Form JavaScript

// Функція для захисту від XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Функція для отримання назви теми
function getTopicName(topic) {
    const topics = {
        'development': 'Розробка веб-сайту',
        'mobile': 'Мобільний додаток',
        'ai': 'AI рішення',
        'consultation': 'Консультація',
        'other': 'Інше'
    };
    return topics[topic] || topic;
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    const successMessage = document.getElementById('formSuccessMessage');
    const clearBtn = document.getElementById('clearDraftBtn');
    const previewModal = document.getElementById('previewModal');
    
    if (!form) {
        console.log('Форму не знайдено');
        return;
    }
    
    console.log('Форма знайдена, додаємо обробник');
    
    // Лічильник символів
    const messageTextarea = document.getElementById('message');
    const charCountSpan = document.getElementById('charCount');
    
    if (messageTextarea && charCountSpan) {
        messageTextarea.addEventListener('input', function() {
            charCountSpan.textContent = this.value.length;
        });
    }
    
    // Функція показу помилки поля
    function showFieldError(errorId, message) {
        const errorEl = document.getElementById(errorId);
        if (errorEl) {
            errorEl.textContent = message;
        }
    }
    
    // Валідація поля
    function validateField(field, errorId, validator, errorMsg) {
        if (!field) return false;
        const value = field.value.trim();
        const errorEl = document.getElementById(errorId);
        
        if (!validator(value)) {
            field.classList.add('error');
            if (errorEl) errorEl.textContent = errorMsg;
            return false;
        } else {
            field.classList.remove('error');
            if (errorEl) errorEl.textContent = '';
            return true;
        }
    }
    
    // Валідатори
    const validators = {
        name: (val) => val.length >= 2 && val.length <= 50,
        email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
        topic: (val) => val !== '',
        message: (val) => val.length >= 10 && val.length <= 500,
        agree: () => {
            const checkbox = document.querySelector('input[name="agree"]');
            return checkbox ? checkbox.checked : false;
        }
    };
    
    // Повідомлення про помилки
    const errorMessages = {
        name: 'Ім\'я повинно містити від 2 до 50 символів',
        email: 'Введіть коректну email адресу',
        topic: 'Оберіть тему звернення',
        message: 'Повідомлення повинно містити від 10 до 500 символів',
        agree: 'Необхідно погодитись з умовами'
    };
    
    // Функція показу прев'ю
    function showPreview(data) {
        if (!previewModal) return;
        
        const previewContent = document.getElementById('previewContent');
        if (previewContent) {
            previewContent.innerHTML = `
                <div style="margin-bottom: 15px;">
                    <strong>Ім'я:</strong> ${escapeHtml(data.name)}
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>Email:</strong> ${escapeHtml(data.email)}
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>Телефон:</strong> ${escapeHtml(data.phone || 'Не вказано')}
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>Тема:</strong> ${escapeHtml(getTopicName(data.topic))}
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>Спосіб зв'язку:</strong> ${data.contactWay === 'email' ? 'Email' : 'Телефон'}
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>Повідомлення:</strong>
                    <p style="margin-top: 5px; padding: 10px; background: var(--bg-tertiary); border-radius: 8px;">${escapeHtml(data.message)}</p>
                </div>
            `;
        }
        
        previewModal.classList.add('active');
    }
    
    // Закриття модального вікна
    function closePreviewModal() {
        if (previewModal) previewModal.classList.remove('active');
    }
    
    // Підтвердження відправки
    let pendingData = null;
    
    function confirmSubmit() {
        if (pendingData) {
            console.log('Форма відправлена:', pendingData);
            
            // Ховаємо форму і показуємо повідомлення
            form.style.display = 'none';
            if (successMessage) {
                successMessage.style.display = 'block';
            }
            
            // Очищаємо чернетку
            localStorage.removeItem('contactFormDraft');
            
            // Закриваємо модальне вікно
            closePreviewModal();
            
            // Скидаємо pendingData
            pendingData = null;
        }
    }
    
    // Обробка відправки форми
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        console.log('Submit event triggered');
        
        // Отримуємо поля
        const nameField = document.getElementById('name');
        const emailField = document.getElementById('email');
        const topicField = document.getElementById('topic');
        const messageField = document.getElementById('message');
        const phoneField = document.getElementById('phone');
        const contactWayField = document.querySelector('input[name="contactWay"]:checked');
        
        // Валідація
        let isValid = true;
        
        if (!validateField(nameField, 'nameError', validators.name, errorMessages.name)) isValid = false;
        if (!validateField(emailField, 'emailError', validators.email, errorMessages.email)) isValid = false;
        if (!validateField(topicField, 'topicError', validators.topic, errorMessages.topic)) isValid = false;
        if (!validateField(messageField, 'messageError', validators.message, errorMessages.message)) isValid = false;
        
        const agreeCheckbox = document.querySelector('input[name="agree"]');
        const agreeError = document.getElementById('agreeError');
        if (!agreeCheckbox || !agreeCheckbox.checked) {
            isValid = false;
            if (agreeError) agreeError.textContent = errorMessages.agree;
            if (agreeCheckbox) agreeCheckbox.classList.add('error');
        } else {
            if (agreeError) agreeError.textContent = '';
            if (agreeCheckbox) agreeCheckbox.classList.remove('error');
        }
        
        if (!isValid) {
            alert('Будь ласка, виправте помилки у формі');
            return;
        }
        
        // Збираємо дані
        const formData = {
            name: nameField ? nameField.value : '',
            email: emailField ? emailField.value : '',
            phone: phoneField ? phoneField.value : '',
            topic: topicField ? topicField.value : '',
            contactWay: contactWayField ? contactWayField.value : 'email',
            message: messageField ? messageField.value : ''
        };
        
        console.log('Дані форми:', formData);
        
        // Зберігаємо дані для підтвердження
        pendingData = formData;
        
        // Показуємо модальне вікно з підтвердженням
        showPreview(formData);
    });
    
    // Очищення форми
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (confirm('Ви впевнені, що хочете очистити форму?')) {
                form.reset();
                if (charCountSpan) charCountSpan.textContent = '0';
                document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
                document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
                
                // Очищаємо чернетку
                localStorage.removeItem('contactFormDraft');
            }
        });
    }
    
    // Закриття модального вікна
    const modalCloseBtns = document.querySelectorAll('.modal-close, .modal-cancel');
    modalCloseBtns.forEach(btn => {
        btn.addEventListener('click', closePreviewModal);
    });
    
    const modalConfirmBtn = document.querySelector('.modal-confirm');
    if (modalConfirmBtn) {
        modalConfirmBtn.addEventListener('click', confirmSubmit);
    }
    
    // Закриття по кліку на оверлей
    window.addEventListener('click', (e) => {
        if (e.target === previewModal) closePreviewModal();
    });
    
    // Збереження чернетки
    function saveDraft() {
        const formData = {
            name: document.getElementById('name')?.value || '',
            email: document.getElementById('email')?.value || '',
            phone: document.getElementById('phone')?.value || '',
            topic: document.getElementById('topic')?.value || '',
            message: document.getElementById('message')?.value || ''
        };
        localStorage.setItem('contactFormDraft', JSON.stringify(formData));
    }
    
    // Завантаження чернетки
    function loadDraft() {
        const draft = localStorage.getItem('contactFormDraft');
        if (draft) {
            const data = JSON.parse(draft);
            if (data.name) {
                const nameField = document.getElementById('name');
                if (nameField) nameField.value = data.name;
            }
            if (data.email) {
                const emailField = document.getElementById('email');
                if (emailField) emailField.value = data.email;
            }
            if (data.phone) {
                const phoneField = document.getElementById('phone');
                if (phoneField) phoneField.value = data.phone;
            }
            if (data.topic) {
                const topicField = document.getElementById('topic');
                if (topicField) topicField.value = data.topic;
            }
            if (data.message) {
                const messageField = document.getElementById('message');
                if (messageField) {
                    messageField.value = data.message;
                    if (charCountSpan) charCountSpan.textContent = data.message.length;
                }
            }
            console.log('Чернетку завантажено');
        }
    }
    
    // Автозбереження
    const allInputs = form.querySelectorAll('input, select, textarea');
    allInputs.forEach(input => {
        input.addEventListener('input', saveDraft);
        input.addEventListener('change', saveDraft);
    });
    
    loadDraft();
    
    console.log('Форма ініціалізована');
});