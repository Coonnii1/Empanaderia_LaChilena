/* ===========================
   La Chilena - script.js (corregido)
   =========================== */

/* ====== Datos iniciales ====== */
const PRODUCTS = [
  {
    id: 1,
    nombre: "Empanada de Pino",
    categoria: "Clásicas",
    precio: 1500,
    ingredientes: "Carne, cebolla, huevo duro, aceitunas, pasas",
    img: "https://cdn-icons-png.flaticon.com/512/857/857681.png",
    extras: [
      { id: "pebre", name: "Pebre", price: 300 },
      { id: "aji", name: "Ají", price: 200 },
      { id: "bebida", name: "Bebida 350ml", price: 800 }
    ]
  },
  {
    id: 2,
    nombre: "Empanada de Queso",
    categoria: "Clásicas",
    precio: 1300,
    ingredientes: "Queso derretido",
    img: "https://cdn-icons-png.flaticon.com/512/857/857681.png",
    extras: [
      { id: "mayo", name: "Mayonesa", price: 200 },
      { id: "ketchup", name: "Ketchup", price: 200 }
    ]
  },
  {
    id: 3,
    nombre: "Empanada Napolitana",
    categoria: "Especiales",
    precio: 1800,
    ingredientes: "Queso, tomate, orégano",
    img: "https://cdn-icons-png.flaticon.com/512/857/857681.png",
    extras: [
      { id: "queso", name: "Queso extra", price: 400 },
      { id: "bebida", name: "Bebida 500ml", price: 1000 }
    ]
  },
  {
    id: 4,
    nombre: "Empanada de Pollo",
    categoria: "Clásicas",
    precio: 1600,
    ingredientes: "Pollo desmenuzado, cebolla, condimentos",
    img: "https://cdn-icons-png.flaticon.com/512/857/857681.png",
    extras: [
      { id: "salsa", name: "Salsa BBQ", price: 250 }
    ]
  },
  {
    id: 5,
    nombre: "Empanada Vegana",
    categoria: "Veganas",
    precio: 1400,
    ingredientes: "Verduras salteadas, champiñones, especias",
    img: "https://cdn-icons-png.flaticon.com/512/857/857681.png",
    extras: [
      { id: "pebre", name: "Pebre", price: 300 }
    ]
  },
  {
    id: 6,
    nombre: "Empanada de Mariscos",
    categoria: "Premium",
    precio: 2200,
    ingredientes: "Mezcla de mariscos, crema y especias",
    img: "https://cdn-icons-png.flaticon.com/512/857/857681.png",
    extras: [
      { id: "limon", name: "Limón extra", price: 150 }
    ]
  }
];

/* ====== Variables globales ====== */
let cart = JSON.parse(localStorage.getItem("la_chilena_cart") || "[]");
let users = JSON.parse(localStorage.getItem("la_chilena_users") || "[]");
let currentUser = JSON.parse(localStorage.getItem("la_chilena_user") || "null");
let orders = JSON.parse(localStorage.getItem("la_chilena_orders") || "[]");

/* ====== Referencias de elementos ====== */
const views = document.querySelectorAll(".view");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const categoryFilter = document.getElementById("categoryFilter");
const priceFilter = document.getElementById("priceFilter");
const searchInput = document.getElementById("searchInput");
const loginBtnEl = document.getElementById("loginBtn");

/* ===========================
   Inicialización
   =========================== */
init();

function init() {
  loadCategories();
  renderCatalog();
  renderCart();
  // asegurar que el loginBtn tenga comportamiento correcto desde el inicio
  updateLoginButton(!!currentUser);
  // añadir listeners a botones nav que sí tengan data-view
  document.querySelectorAll(".nav-btn").forEach(btn => {
    const view = btn.dataset.view;
    if (view) {
      btn.addEventListener("click", () => showView(view));
    }
  });
  // setear comportamiento por defecto del loginBtn si no está cubierto
  if (!loginBtnEl.dataset.view) {
    // updateLoginButton ya estableció el onclick o el texto
    // (si hay usuario actual, updateLoginButton creó el logout)
    // si no, dejaremos el botón para abrir la vista login
    if (!currentUser) {
      loginBtnEl.onclick = () => showView("login");
    }
  }
}

/* ===========================
   Manejo de vistas
   =========================== */
function showView(viewId) {
  if (!viewId) return;
  // buscar el elemento target: esperamos que las secciones estén nombradas como `${viewId}View`
  const target = document.getElementById(viewId + "View");
  if (!target) {
    // no existe la vista pedida -> no hacemos nada (evita errores JS)
    console.warn("Vista no encontrada:", viewId);
    return;
  }
  views.forEach(v => v.classList.remove("active"));
  target.classList.add("active");
  window.scrollTo(0, 0);
}

/* ===========================
   Renderizado de catálogo
   =========================== */
function loadCategories() {
  const cats = [...new Set(PRODUCTS.map(p => p.categoria))];
  cats.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    categoryFilter.appendChild(opt);
  });
}

function renderCatalog() {
  const container = document.getElementById("catalogContainer");
  if (!container) return;
  container.innerHTML = "";

  const q = (searchInput && searchInput.value || "").toLowerCase();
  const cat = categoryFilter ? categoryFilter.value : "";
  const price = priceFilter ? priceFilter.value : "";

  let list = PRODUCTS.filter(p => {
    if (cat && p.categoria !== cat) return false;
    if (q && !p.nombre.toLowerCase().includes(q)) return false;
    if (price) {
      const [min, max] = price.split("-").map(Number);
      if (!(p.precio >= min && p.precio <= max)) return false;
    }
    return true;
  });

  list.forEach(p => {
    const div = document.createElement("div");
    div.className = "item-card";
    div.innerHTML = `
      <img src="${p.img}" alt="${p.nombre}">
      <h4>${p.nombre}</h4>
      <div class="small">${p.categoria}</div>
      <div class="price">$${p.precio.toLocaleString()}</div>
      <button class="btn primary" data-id="${p.id}">Ver detalles</button>
    `;
    // delegación: manejar click en el botón de detalles
    div.querySelector("button").addEventListener("click", () => openProduct(p.id));
    container.appendChild(div);
  });

  if (list.length === 0) {
    container.innerHTML = `<p class="small">No se encontraron empanadas con esos filtros.</p>`;
  }
}

// listeners filtros
if (searchInput) searchInput.oninput = renderCatalog;
if (categoryFilter) categoryFilter.onchange = renderCatalog;
if (priceFilter) priceFilter.onchange = renderCatalog;
const resetBtn = document.getElementById("resetFilters");
if (resetBtn) resetBtn.onclick = () => {
  if (searchInput) searchInput.value = "";
  if (categoryFilter) categoryFilter.value = "";
  if (priceFilter) priceFilter.value = "";
  renderCatalog();
};

/* ===========================
   Detalle de producto (modal)
   =========================== */
function openProduct(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  modalBody.innerHTML = `
    <h3>${p.nombre}</h3>
    <p><strong>Ingredientes:</strong> ${p.ingredientes}</p>
    <p><strong>Precio base:</strong> $${p.precio.toLocaleString()}</p>
    <div><strong>Extras:</strong></div>
    ${p.extras.map(ex => `
      <label><input type="checkbox" value="${ex.id}" data-price="${ex.price}"> ${ex.name} (+$${ex.price})</label><br>
    `).join("")}
    <div style="margin-top:10px;">
      <input type="number" id="qty" min="1" value="1" style="width:60px;">
      <button class="btn primary" id="addToCartBtn">Agregar al carrito</button>
    </div>
  `;
  // bind del botón agregar
  const addBtn = document.getElementById("addToCartBtn");
  addBtn.onclick = () => addToCartFromModal(p.id);
  modal.classList.add("active");
}

function addToCartFromModal(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const qtyEl = modalBody.querySelector("#qty");
  const qty = qtyEl ? Number(qtyEl.value) : 1;
  const extrasChecked = [...modalBody.querySelectorAll("input[type=checkbox]:checked")];
  const extras = extrasChecked.map(ch => {
    const ex = p.extras.find(e => e.id === ch.value);
    return { name: ex.name, price: ex.price };
  });

  const keyExtras = JSON.stringify(extras.map(e => e.name).sort());
  const idx = cart.findIndex(it => it.id === id && JSON.stringify(it.extras.map(x => x.name).sort()) === keyExtras);

  if (idx >= 0) {
    cart[idx].cantidad += qty;
  } else {
    cart.push({ id, nombre: p.nombre, precioBase: p.precio, cantidad: qty, extras });
  }

  saveState();
  renderCart();
  modal.classList.remove("active");
}

/* ===========================
   Carrito
   =========================== */
function renderCart() {
  const list = document.getElementById("cartList");
  const totalEl = document.getElementById("cartTotal");
  const emptyMsg = document.getElementById("emptyCartMsg");

  if (!list || !totalEl || !emptyMsg) return;

  list.innerHTML = "";
  if (cart.length === 0) {
    emptyMsg.style.display = "block";
    totalEl.textContent = "0";
    return;
  }
  emptyMsg.style.display = "none";

  cart.forEach((it, i) => {
    const extrasTxt = it.extras && it.extras.length ? it.extras.map(e => e.name).join(", ") : "Sin extras";
    const totalLine = (it.precioBase + (it.extras ? it.extras.reduce((a,b)=>a+b.price,0) : 0)) * it.cantidad;

    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <strong>${it.nombre}</strong><br>
        <small>Extras: ${extrasTxt}</small><br>
        <small>Cantidad: ${it.cantidad}</small>
      </div>
      <div style="text-align:right;">
        <div><strong>$${totalLine.toLocaleString()}</strong></div>
        <div style="display:flex;gap:6px;justify-content:flex-end;margin-top:6px">
          <button class="btn secondary" data-action="dec" data-i="${i}">-</button>
          <button class="btn secondary" data-action="inc" data-i="${i}">+</button>
          <button class="btn" style="background:#f8d6d6;color:#a33" data-action="del" data-i="${i}">Eliminar</button>
        </div>
      </div>
    `;
    list.appendChild(li);
  });

  // listeners acciones (delegación simple)
  list.querySelectorAll("button").forEach(b => {
    const i = Number(b.dataset.i);
    const action = b.dataset.action;
    if (action === "inc") b.onclick = () => { incQty(i); };
    if (action === "dec") b.onclick = () => { decQty(i); };
    if (action === "del") b.onclick = () => { removeItem(i); };
  });

  totalEl.textContent = calcTotal().toLocaleString();
}

function incQty(i) { cart[i].cantidad++; saveState(); renderCart(); }
function decQty(i) { cart[i].cantidad = Math.max(1, cart[i].cantidad-1); saveState(); renderCart(); }
function removeItem(i) { cart.splice(i,1); saveState(); renderCart(); }
function calcTotal() {
  return cart.reduce((sum, it) => sum + ((it.precioBase || 0) + (it.extras ? it.extras.reduce((a,b)=>a+b.price,0) : 0)) * it.cantidad, 0);
}
const clearCartBtn = document.getElementById("clearCart");
if (clearCartBtn) clearCartBtn.onclick = () => { cart = []; saveState(); renderCart(); };

/* ===========================
   Checkout
   =========================== */
const checkoutBtn = document.getElementById("checkoutBtn");
if (checkoutBtn) checkoutBtn.onclick = () => {
  if (cart.length === 0) return alert("Tu carrito está vacío");
  if (!currentUser) return alert("Inicia sesión antes de continuar");

  modalBody.innerHTML = `
    <h3>Resumen del pedido</h3>
    ${cart.map(it => `
      <div><strong>${it.nombre}</strong> x${it.cantidad} - $${((it.precioBase + (it.extras ? it.extras.reduce((a,b)=>a+b.price,0) : 0))*it.cantidad).toLocaleString()}</div>
    `).join("")}
    <hr>
    <p><strong>Total:</strong> $${calcTotal().toLocaleString()}</p>
    <h4>Selecciona forma de pago:</h4>
    <label><input type="radio" name="pago" value="efectivo" checked> Efectivo</label><br>
    <label><input type="radio" name="pago" value="transferencia"> Transferencia</label><br>
    <label><input type="radio" name="pago" value="tarjeta"> Tarjeta</label><br><br>
    <button class="btn primary" id="confirmOrderBtn">Confirmar pedido</button>
  `;
  // bind botón confirmar
  document.getElementById("confirmOrderBtn").onclick = confirmOrder;
  modal.classList.add("active");
};

function confirmOrder() {
  const pagoEl = modalBody.querySelector("input[name='pago']:checked");
  const metodo = pagoEl ? pagoEl.value : "efectivo";
  const order = {
    id: "PED-" + Date.now(),
    user: currentUser.email,
    userName: currentUser.name,
    items: cart,
    total: calcTotal(),
    metodo,
    date: new Date().toLocaleString()
  };
  orders.push(order);
  cart = [];
  saveState();
  renderCart();
  modal.classList.remove("active");
  alert(`Pedido confirmado (${metodo}). ¡Gracias ${order.userName}!`);
}

/* ===========================
   Registro / Login
   =========================== */
const registerBtn = document.getElementById("registerBtn");
if (registerBtn) registerBtn.onclick = () => {
  const name = (document.getElementById("nameInput") || {}).value || "";
  const email = ((document.getElementById("emailInput") || {}).value || "").trim().toLowerCase();
  const pass = (document.getElementById("passwordInput") || {}).value || "";
  if (!name || !email || !pass) return alert("Completa todos los campos.");
  if (users.find(u => u.email === email)) return alert("Ese correo ya está registrado.");
  users.push({ name, email, pass });
  currentUser = { name, email };
  saveState();
  updateLoginButton(true);
  alert(`Bienvenido/a ${name}`);
  showView("catalog");
};

const loginUserBtn = document.getElementById("loginUserBtn");
if (loginUserBtn) loginUserBtn.onclick = () => {
  const email = ((document.getElementById("emailInput") || {}).value || "").trim().toLowerCase();
  const pass = (document.getElementById("passwordInput") || {}).value || "";
  const u = users.find(x => x.email === email && x.pass === pass);
  if (!u) return alert("Credenciales incorrectas.");
  currentUser = { name: u.name, email: u.email };
  saveState();
  updateLoginButton(true);
  alert(`Hola ${u.name}`);
  showView("catalog");
};

function updateLoginButton(loggedIn) {
  const btn = loginBtnEl;
  if (!btn) return;
  if (loggedIn) {
    btn.textContent = "Cerrar sesión";
    btn.onclick = () => {
      currentUser = null;
      saveState();
      updateLoginButton(false);
      alert("Sesión cerrada");
      showView("home");
    };
  } else {
    btn.textContent = "Iniciar sesión";
    btn.onclick = () => showView("login");
  }
}

/* ===========================
   Historial de pedidos
   =========================== */
const ordersNavBtn = document.querySelector("[data-view='orders']");
if (ordersNavBtn) {
  ordersNavBtn.onclick = () => {
    if (!currentUser) return alert("Inicia sesión para ver tus pedidos");
    const myOrders = orders.filter(o => o.user === currentUser.email);
    const container = document.getElementById("ordersContainer");
    if (!container) return;
    if (myOrders.length === 0) {
      container.innerHTML = "<p>No tienes pedidos aún.</p>";
    } else {
      container.innerHTML = myOrders.map(o => `
        <div class="order-card">
          <strong>${o.id}</strong> - ${o.date}<br>
          <small>${o.items.length} ítems — Total: $${o.total.toLocaleString()} (${o.metodo})</small>
        </div>
      `).join("");
    }
    showView("orders");
  };
}

/* ===========================
   Modal control
   =========================== */
const closeModalBtn = document.getElementById("closeModal");
if (closeModalBtn) closeModalBtn.onclick = () => modal.classList.remove("active");
// también cerrar modal si se hace click fuera del contenido
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.remove("active");
});

/* ===========================
   Guardado de estado
   =========================== */
function saveState() {
  localStorage.setItem("la_chilena_cart", JSON.stringify(cart));
  localStorage.setItem("la_chilena_users", JSON.stringify(users));
  localStorage.setItem("la_chilena_user", JSON.stringify(currentUser));
  localStorage.setItem("la_chilena_orders", JSON.stringify(orders));
}
