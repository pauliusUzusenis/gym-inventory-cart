const cartBtn = document.querySelector('.navbar-cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.navbar-cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const favoriteProductsDOM = document.querySelector('.favorite-products').children[1]
const productsDOM = document.querySelector('.products').children[1];
const txtBagBtnInCart = "In Cart";
const currencySymbol = "€";

let cart = [];
let buttonsDOM = [];

function Products() {
  async function getProducts() {
    try {
      let result = await fetch('products.json');
      let resultData = await result.json();
      let products = resultData.data;
      products = products.map(item => {
        const {
          id,
          category,
          title,
          price,
          sale,
          oldprice
        } = item;
        const image = item.image.url;
        return createProduct(id, category, title, price, image, sale, oldprice);
      })
      return products;
    } catch (error) {
    }
  };

  function createProduct(id, category, title, price, image, sale, oldprice) {
    return {
      id: id,
      category: category,
      title: title,
      price: price,
      image: image,
      sale: sale,
      oldprice: oldprice
    }
  };

  return  {
    getProducts : getProducts
  }
}
class UI {
  static displayProducts(products) {
    const productsOnSale = products.filter(e => e.sale);
    const productsNotSale = products.filter(e => !e.sale);
    let productsOnSaleHTML = '';
    let productsHTML = '';
    productsOnSale.forEach(product => {
      productsOnSaleHTML += 
        `<article class="product box-shadow">
          <div class="img-container">
              <img src=${product.image}
              alt="product" 
              class="product-img">
              <div class="sale-label box-shadow">sale</div>
              <button class="bag-btn box-shadow" data-id=${product.id}>
                  add to cart
              </button>
          </div>
          <h5>${product.category}</h5>
          <h3>${product.title}</h3>
          <h4><span class="oldPrice">${currencySymbol}${product.oldprice}</span> ${currencySymbol}${product.price}</h4>
        </article>`
    });
    productsNotSale.forEach(product => {
      productsHTML += 
        `<article class="product box-shadow">
        <div class="img-container">
            <img src=${product.image}
            alt="product" 
            class="product-img">
            <button class="bag-btn box-shadow" data-id=${product.id}>
                add to cart
            </button>
        </div>
        <h5>${product.category}</h5>
        <h3>${product.title}</h3>
        <h4>${currencySymbol}${product.price}</h4>
      </article>`;
    });
    favoriteProductsDOM.innerHTML = productsOnSaleHTML;
    productsDOM.innerHTML = productsHTML;
  }
  static getBagButtons() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = buttons;
    buttons.forEach(button => {
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id);
      if (inCart) {
        button.innerText = txtBagBtnInCart;
        button.disabled = true;
      }
      button.addEventListener('click', (event) => {
        event.target.innerText = txtBagBtnInCart;
        event.target.disabled = true;
        let cartItem = UI.createCartItem(Storage.getProduct(id));
        cart = [...cart, cartItem];
        Storage.saveCart(cart);
        UI.setTotalCartValues(cart);
        UI.addItemContentToCart(cartItem);
      })
    })
  };

  static createCartItem(product) {
    return Object.assign({}, product, {amount: 1})
  }

  static setTotalCartValues(cart) {
    let tempTotal = 0;
    let tempItemsCount = 0;
    cart.map(item => {
      tempTotal += item.price * item.amount;
      tempItemsCount += item.amount;
    });
    cartTotal.innerText = currencySymbol + parseFloat(tempTotal).toFixed(2);
    cartItems.innerText = tempItemsCount;
  };
  static addItemContentToCart(item) {
    const div = document.createElement('div');
    div.classList.add('cart-item', 'box-shadow');
    div.innerHTML = 
    `<img class="cart-item-img" src=${item.image} alt="product">
    <div>
        <div class="cart-item-description">
          <h4>${item.title}</h4>
          <h5>${item.sale ? `<span class="oldPrice">${currencySymbol}${item.oldprice}</span> ` : ''}${currencySymbol}${item.price}</h5>
        </div>
        <span class="iconify remove-item" data-icon="mdi-window-close" data-inline="false" data-id=${item.id}></span>
    </div>
    <div class="cart-item-btns-container">
      <div class="cart-item-btns">
        <div class="cart-item-btn-img-container">
          <img src="./images/add-button.jpg" class="img increase-item" data-id=${item.id}>
        </div>
        <p class="item-amount">${item.amount}</p>
        <div class="cart-item-btn-img-container">
          <img src="./images/remove-button.jpg" class="img decrease-item" data-id=${item.id}>
        </div>
      </div>
    </div>`;
    cartContent.appendChild(div);
  };
  static showCart() {
    cartOverlay.classList.add('visible');
    cartDOM.classList.add('showCart');
  };
  static hideCart() {
    cartOverlay.classList.remove('visible');
    cartDOM.classList.remove('showCart');
  };
  static setupCart() {
    cart = Storage.getCart();
    UI.setTotalCartValues(cart);
    UI.populateCart(cart);
    cartBtn.addEventListener('click', UI.showCart);
    closeCartBtn.addEventListener('click', UI.hideCart);
  };
  static populateCart(cart) {
    cart.forEach(item => {
      UI.addItemContentToCart(item);
    });
  };
  static cartLogic() {
    clearCartBtn.addEventListener("click", () => UI.clearCart());
    cartContent.addEventListener('click', event => {
      if (event.target.classList.contains('remove-item')) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        UI.removeItem(id);
        cartContent.removeChild(removeItem.parentElement.parentElement);
      } 
      else if (event.target.classList.contains('increase-item')) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount += 1;
        Storage.saveCart(cart);
        UI.setTotalCartValues(cart);
        addAmount.parentElement.nextElementSibling.innerText = tempItem.amount;
      } 
      else if (event.target.classList.contains('decrease-item')) {
          let lowerAmount = event.target;
          let id = lowerAmount.dataset.id;
          let tempItem = cart.find(item => item.id === id);
          tempItem.amount -= 1;
          if (tempItem.amount > 0){
            Storage.saveCart(cart);
            UI.setTotalCartValues(cart);
            lowerAmount.parentElement.previousElementSibling.innerText = tempItem.amount; 
        }
        else {
          UI.removeItem(id);    
          cartContent.removeChild(lowerAmount.parentElement.parentElement.parentElement.parentElement);
        }
      };
    })

  };
  static clearCart() {
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => {
      UI.removeItem(id);
    });
    while(cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    };
  };
  static removeItem(id) {
    cart = cart.filter(item => item.id != id);
    UI.setTotalCartValues(cart);
    Storage.saveCart(cart);
    let button = UI.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = 'add to cart';
  };
  static getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id === id);
  };
};

class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  };
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem('products'));
    return products.find(product => product.id == id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  };
  static getCart() {
    return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const products = Products();
  UI.setupCart();
  products.getProducts()
    .then(products => {
      UI.displayProducts(products);
      Storage.saveProducts(products);
    }).then(() => {
      UI.getBagButtons();
      UI.cartLogic();
    });
});