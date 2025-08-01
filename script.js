// Translations
const translations = {
    ro: {
        navHome: "Acasă",
        navMen: "Bărbați",
        navWomen: "Femei",
        navContact: "Contact",
        welcomeTitle: "Bun venit la Kultur",
        welcomeText: "Descoperă colecția noastră de îmbrăcăminte de calitate",
        addToCart: "Adaugă în coș",
        contactTitle: "Contactează-ne",
        phone: "Telefon:",
        email: "Email:",
        address: "Adresă:",
        addressText: "Str. Exemplului nr. 10, București",
        nameLabel: "Nume",
        emailLabel: "Email",
        messageLabel: "Mesaj",
        submitBtn: "Trimite mesajul",
        disclaimer: "Produsele oferite pot varia ușor față de imagini. Consultă ghidul de mărimi pentru mai multe detalii.",
        terms: "Termeni și condiții",
        privacy: "Politica de confidențialitate",
        copyright: "© 2025 Kultur. Toate drepturile rezervate.",
        success: "Mesajul a fost trimis cu succes!",
        addedToCart: "Produs adăugat în coș!",
        ShoppingCart: "Coș de Cumpărături",
        cartTitle: "Coș de cumpărături",
        quantity: "Cantitate",
        checkout: "Finalizează comanda",
        price: "Preț:",
        subtotal: "Subtotal"
    },
    en: {
        navHome: "Home",
        navMen: "Men",
        navWomen: "Women",
        navContact: "Contact",
        welcomeTitle: "Welcome to Kultur",
        welcomeText: "Discover our quality clothing collection",
        addToCart: "Add to Cart",
        contactTitle: "Contact Us",
        phone: "Phone:",
        email: "Email:",
        address: "Address:",
        addressText: "Example Street no. 10, Bucharest",
        nameLabel: "Name",
        emailLabel: "Email",
        messageLabel: "Message",
        submitBtn: "Send Message",
        disclaimer: "Products may slightly differ from images. Check the size guide for more details.",
        terms: "Terms and Conditions",
        privacy: "Privacy Policy",
        copyright: "© 2025 Kultur. All rights reserved.",
        success: "Message sent successfully!",
        addedToCart: "Product added to cart!",
        ShoppingCart: "Shopping Cart",
        cartTitle: "Shopping Cart",
        quantity: "Quantity",
        checkout: "Checkout",
        price: "Price:",
        subtotal: "Subtotal"
    }
};

class LanguageManager {
    constructor() {
        this.currentLang = this.detectLanguage();
        this.init();
    }
    detectLanguage() {
        return sessionStorage.getItem('kulturLang') || (navigator.language.startsWith('ro') ? 'ro' : 'en');
    }
    init() {
        this.updateLanguage(this.currentLang);
        document.getElementById('langToggle').addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleLanguage();
        });
    }
    toggleLanguage() {
        this.currentLang = this.currentLang === 'ro' ? 'en' : 'ro';
        this.updateLanguage(this.currentLang);
        sessionStorage.setItem('kulturLang', this.currentLang);
    }
    updateLanguage(lang) {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });
        document.getElementById('langToggle').textContent = lang === 'ro' ? 'EN' : 'RO';
        document.documentElement.lang = lang;
    }
    t(key) {
        return translations[this.currentLang][key] || key;
    }
}

class PageManager {
    constructor() {
        this.currentPage = 'home';
        this.init();
    }

    init() {
        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                this.navigateTo(page);
            });
        });
        setTimeout(() => {
            document.getElementById('pageContainer').classList.add('page-loaded');
        }, 100);
    }

    navigateTo(page) {
        if (!page || page === this.currentPage) return;

        document.querySelectorAll('.page-content').forEach(p => p.style.display = 'none');
        const newPageEl = document.getElementById(page + 'Page');
        if (newPageEl) {
            newPageEl.style.display = 'block';
            newPageEl.style.opacity = '0';
            newPageEl.style.transform = 'translateY(20px)';
            requestAnimationFrame(() => {
                newPageEl.style.transition = 'all 0.3s ease';
                newPageEl.style.opacity = '1';
                newPageEl.style.transform = 'translateY(0)';
            });
        }

        this.currentPage = page;
        document.querySelectorAll('[data-page]').forEach(link => {
            link.style.opacity = link.getAttribute('data-page') === page ? '1' : '0.7';
        });

        window.langManager.updateLanguage(window.langManager.currentLang);

        // Actualizăm subtotalul atunci când revenim pe pagina de coș
        if (page === 'ShoppingCart' && window.cart) {
            window.cart.renderCart();
            window.cart.updateSubtotal();  // Asigurăm că subtotalul este actualizat
        }
    }
}

class ShoppingCart {
    constructor() {
        this.items = this.loadCart();
    }

    loadCart() {
        try {
            return JSON.parse(sessionStorage.getItem('kulturCart') || '[]');
        } catch {
            return [];
        }
    }

    saveCart() {
        sessionStorage.setItem('kulturCart', JSON.stringify(this.items));
    }

    addItem(product) {
        const existing = this.items.find(item => item.name === product.name);
        if (existing) {
            existing.quantity += 1;
        } else {
            this.items.push({ ...product, quantity: 1 });
        }
        this.saveCart();
        this.showNotification(window.langManager.t('addedToCart'));
        this.updateSubtotal();  // Actualizăm subtotalul după adăugarea unui produs
    }

    showNotification(msg) {
        const n = document.createElement('div');
        n.textContent = msg;
        n.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            z-index: 1000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        document.body.appendChild(n);
        requestAnimationFrame(() => {
            n.style.opacity = '1';
            n.style.transform = 'translateX(0)';
        });
        setTimeout(() => {
            n.style.opacity = '0';
            n.style.transform = 'translateX(100%)';
            setTimeout(() => n.remove(), 300);
        }, 3000);
    }

    renderCart() {
        const cartContainer = document.getElementById('ShoppingCartPage');
        if (!cartContainer) return;

        cartContainer.innerHTML = `
            <div class="cart-container">
                <h1 class="cart-title" data-i18n="cartTitle">${window.langManager.t('cartTitle')}</h1>
                <div class="cart-items">
                    ${this.items.length === 0 ? '<p style="padding: 1rem;">Coșul este gol.</p>' : this.items.map((item, i) => `
                        <div class="cart-item">
                            <div class="item-details">
                                <h2 class="item-name">${item.name}</h2>
                                <p class="item-price">${window.langManager.t('price')} ${item.price}</p>
                                <label data-i18n="quantity">${window.langManager.t('quantity')}:</label>
                                <input type="number" class="item-qty" value="${item.quantity}" min="1" data-index="${i}" />
                            </div>
                            <div class="item-total">${this.formatTotal(item.price, item.quantity)}</div>
                            <button class="remove-btn" data-index="${i}">&times;</button>
                        </div>
                    `).join('')}
                </div>
                ${this.items.length > 0 ? `
                    <div class="cart-summary">
                        <h3 id="cartSubtotal" data-i18n="subtotal">${window.langManager.t('subtotal')}: ${this.getTotal()} RON</h3>
                        <button class="checkout-btn">${window.langManager.t('checkout')}</button>
                    </div>` : ''}
            </div>`;

        // Actualizăm subtotalul
        this.updateSubtotal();

        window.langManager.updateLanguage(window.langManager.currentLang);

        cartContainer.querySelectorAll('.item-qty').forEach(input => {
            input.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.index);
                const qty = parseInt(e.target.value);
                if (qty > 0 && index >= 0 && index < this.items.length) {
                    this.items[index].quantity = qty;
                    this.saveCart();
                    this.updateSubtotal(); // Actualizăm subtotalul după schimbarea cantității
                }
            });
        });

        cartContainer.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const i = parseInt(e.target.getAttribute('data-index'));
                this.items.splice(i, 1);
                this.saveCart();
                this.renderCart();
                this.updateSubtotal();  // Actualizăm subtotalul după eliminarea unui produs
            });
        });
    }

    // Actualizăm subtotalul
    updateSubtotal() {
        const cartSubtotalElement = document.getElementById('cartSubtotal');
        if (cartSubtotalElement) {
            cartSubtotalElement.textContent = `${window.langManager.t('subtotal')}: ${this.getTotal()} RON`;
        }
    }

    getTotal() {
        return this.items.reduce((sum, item) => {
            const price = parseFloat(item.price.replace(/[^\d,.-]/g, '').replace(',', '.'));
            return sum + price * item.quantity;
        }, 0).toFixed(2);
    }

    formatTotal(price, qty) {
        const numeric = parseFloat(price.replace(/[^\d,.-]/g, '').replace(',', '.'));
        return (numeric * qty).toFixed(2) + ' RON';
    }
}

class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.btn = document.getElementById('submitBtn');
        this.init();
    }
    init() {
        if (this.form) {
            this.form.addEventListener('submit', e => this.submit(e));
        }
    }
    async submit(e) {
        e.preventDefault();
        const original = this.btn.innerHTML;
        this.btn.innerHTML = '<div class="loading"></div>';
        this.btn.disabled = true;
        await new Promise(res => setTimeout(res, 1500));
        this.form.reset();
        this.btn.innerHTML = original;
        this.btn.disabled = false;
        this.successMessage();
    }
    successMessage() {
        const msg = document.createElement('div');
        msg.textContent = window.langManager.t('success');
        msg.style.cssText = `position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); background: #4CAF50; color: white; padding: 2rem; border-radius: 10px; z-index: 1000; opacity: 0; transition: all 0.3s ease;`;
        document.body.appendChild(msg);
        requestAnimationFrame(() => { msg.style.opacity = '1'; });
        setTimeout(() => {
            msg.style.opacity = '0';
            setTimeout(() => msg.remove(), 300);
        }, 3000);
    }
}

function addToCart(button) {
    const card = button.closest('.product-card');
    const name = card.querySelector('.product-title').textContent;
    const price = card.querySelector('.product-price').textContent;
    const product = { name, price, id: Date.now() };
    window.cart.addItem(product);
}

document.addEventListener('DOMContentLoaded', () => {
    window.langManager = new LanguageManager();
    window.pageManager = new PageManager();
    window.cart = new ShoppingCart();
    window.contactForm = new ContactForm();

    document.querySelectorAll('.product-card').forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, i * 100);
    });
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.dropdown-toggle').forEach(button => {
    button.addEventListener('click', () => {
      const menu = button.nextElementSibling;
      menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
    });
  });
});