(function () {
  // Simple static SPA for Delivery App preview (no build, no server)
  const root = document.getElementById('app');

  // State
  const state = {
    activeTab: 'dashboard',
    orders: [],
    drivers: [],
    modal: null, // {type:'assign',orderId}
    q: '',
  };

  // Helpers
  function uid(prefix) { return prefix + Math.random().toString(36).slice(2, 9) }

  // Sample data
  function seed() {
    // attempt to load from localStorage first
    const saved = safeLoad();
    if (saved) {
      state.drivers = saved.drivers || [];
      state.orders = saved.orders || [];
      return;
    }
    if (state.drivers.length) return;
    state.drivers.push({ id: 'DRV-001', name: 'John Smith', phone: '555-0101', vehicle: 'Honda Civic', status: 'available', rating: 4.8 });
    state.drivers.push({ id: 'DRV-002', name: 'Maria Garcia', phone: '555-0102', vehicle: 'Toyota Camry', status: 'available', rating: 4.9 });
    state.drivers.push({ id: 'DRV-003', name: 'Alex Johnson', phone: '555-0103', vehicle: 'Ford Transit', status: 'available', rating: 4.7 });

    state.orders.push({ id: 'ORD-001', customerName: 'Alice Wilson', pickup: '123 Main St', delivery: '456 Oak Ave', status: 'pending', items: [{ name: 'Package', qty: 1, price: 25.99 }], total: 25.99 });
    state.orders.push({ id: 'ORD-002', customerName: 'Bob Brown', pickup: '789 Pine Rd', delivery: '321 Elm St', status: 'in-transit', driverId: 'DRV-001', items: [{ name: 'Electronics', qty: 2, price: 89.99 }], total: 89.99 });
  }

  // Persistence
  function safeLoad() {
    try {
      const raw = localStorage.getItem('delivery_app_state');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { console.warn('load failed', e); return null }
  }

  function save() {
    try {
      const snip = { orders: state.orders, drivers: state.drivers };
      localStorage.setItem('delivery_app_state', JSON.stringify(snip));
    } catch (e) { console.warn('save failed', e) }
  }

  // Debounced save to avoid frequent writes
  function debounce(fn, wait) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }
  const saveDebounced = debounce(save, 300);

  // Render
  function render() {
    root.innerHTML = '';
    const app = el('div', 'container');

    // Header
    const header = el('div', 'header');
    header.appendChild(el('div', 'h1', '🚚 Delivery App'));
    const nav = el('div', 'nav');
    ['dashboard', 'orders', 'drivers'].forEach(tab => {
      const btn = el('button', 'btn ' + (state.activeTab === tab ? 'primary' : ''), capitalize(tab));
      btn.addEventListener('click', () => { state.activeTab = tab; render(); });
      nav.appendChild(btn);
    });
    // controls: search and export/import
    const controls = el('div', 'controls');
    const input = document.createElement('input'); input.className = 'search'; input.placeholder = 'Search orders or drivers'; input.value = state.q || '';
    input.addEventListener('input', (e) => { state.q = e.target.value; render() });
    controls.appendChild(input);
    const exportBtn = el('button', 'btn', 'Export JSON'); exportBtn.addEventListener('click', exportJSON);
    const importBtn = el('button', 'btn', 'Import JSON'); importBtn.addEventListener('click', triggerImport);
    const exportCSVBtn = el('button', 'btn', 'Export CSV'); exportCSVBtn.addEventListener('click', exportCSV);
    const importCSVBtn = el('button', 'btn', 'Import CSV'); importCSVBtn.addEventListener('click', triggerImportCSV);
    const clearBtn = el('button', 'btn', 'Reset'); clearBtn.addEventListener('click', resetData);
    controls.appendChild(exportBtn); controls.appendChild(importBtn); controls.appendChild(exportCSVBtn); controls.appendChild(importCSVBtn); controls.appendChild(clearBtn);
    header.appendChild(nav);
    header.appendChild(controls);
    app.appendChild(header);

    // Main
    if (state.activeTab === 'dashboard') renderDashboard(app);
    if (state.activeTab === 'orders') renderOrders(app);
    if (state.activeTab === 'drivers') renderDrivers(app);

    // Modal
    if (state.modal) renderModal(app);

    root.appendChild(app);
  }

  function renderDashboard(parent) {
    const container = el('div');
    const stats = el('div', 'grid cols-4');
    stats.appendChild(statCard('Total Orders', state.orders.length));
    stats.appendChild(statCard('Pending', state.orders.filter(o => o.status === 'pending').length));
    stats.appendChild(statCard('Delivered', state.orders.filter(o => o.status === 'delivered').length));
    stats.appendChild(statCard('Available Drivers', state.drivers.filter(d => d.status === 'available').length));
    container.appendChild(stats);

    const recent = el('div', 'card');
    recent.appendChild(el('h3', null, 'Recent Orders'));
    const list = el('div', 'list');
    const items = filteredOrders().slice(-5).reverse();
    if (!items.length) list.appendChild(el('div', 'empty', 'No orders yet'));
    items.forEach(o => {
      const row = el('div', 'order');
      const left = el('div');
      left.appendChild(el('div', null, o.customerName + ' — ' + o.pickup + ' → ' + o.delivery));
      left.appendChild(el('div', 'small', '#' + o.id + ' • ' + o.items.length + ' items'));
      row.appendChild(left);
      const right = el('div');
      right.appendChild(el('div', 'small', o.status));
      const assign = el('button', 'btn', 'Assign');
      assign.addEventListener('click', () => { openAssign(o.id) });
      right.appendChild(assign);
      row.appendChild(right);
      list.appendChild(row);
    });
    recent.appendChild(list);
    container.appendChild(spacer(), recent);
    parent.appendChild(container);
  }

  function renderOrders(parent) {
    const wrap = el('div');
    const header = el('div', 'card');
    const h = el('div', 'h2', 'Orders Management');
    header.appendChild(h);
    const newBtn = el('button', 'btn primary', '+ New Order');
    newBtn.addEventListener('click', () => { openNewOrder() });
    header.appendChild(newBtn);
    wrap.appendChild(header);

    const listCard = el('div', 'card');
    const list = el('div', 'list');
    const items = filteredOrders();
    if (!items.length) list.appendChild(el('div', 'empty', 'No orders'));
    items.forEach(o => {
      const row = el('div', 'order');
      const left = el('div');
      left.appendChild(el('div', null, o.customerName));
      left.appendChild(el('div', 'small', '#' + o.id + ' • $' + o.total.toFixed(2)));
      row.appendChild(left);
      const right = el('div');
      right.appendChild(el('div', 'small', o.status));
      const ass = el('button', 'btn', 'Assign'); ass.addEventListener('click', () => openAssign(o.id));
      right.appendChild(ass);
      const mark = el('button', 'btn', 'Mark Delivered'); mark.addEventListener('click', () => { markDelivered(o.id); });
      right.appendChild(mark);
      row.appendChild(right);
      list.appendChild(row);
    });
    listCard.appendChild(list);
    wrap.appendChild(listCard);
    parent.appendChild(wrap);
  }

  function renderDrivers(parent) {
    const wrap = el('div');
    const header = el('div', 'card');
    header.appendChild(el('div', 'h2', 'Drivers Management'));
    const add = el('button', 'btn primary', '+ Add Driver');
    add.addEventListener('click', openNewDriver);
    header.appendChild(add);
    wrap.appendChild(header);

    const listCard = el('div', 'card');
    const list = el('div', 'list');
    if (!state.drivers.length) list.appendChild(el('div', 'empty', 'No drivers'));
    state.drivers.forEach(d => {
      const row = el('div', 'order');
      const left = el('div');
      left.appendChild(el('div', null, d.name));
      left.appendChild(el('div', 'small', d.vehicle + ' • ' + d.phone));
      row.appendChild(left);
      const right = el('div');
      right.appendChild(el('div', 'small', '⭐ ' + d.rating.toFixed(1)));
      const mapBtn = el('button', 'btn', 'Map'); mapBtn.addEventListener('click', () => openDriverMap(d.id));
      right.appendChild(mapBtn);
      row.appendChild(right);
      list.appendChild(row);
    });
    listCard.appendChild(list);
    wrap.appendChild(listCard);
    parent.appendChild(wrap);
  }

  // Modals and forms
  function renderModal(parent) {
    const m = el('div', 'modal');
    const card = el('div', 'card');
    if (state.modal.type === 'new-order') {
      card.appendChild(el('h3', null, 'Create New Order'));
      const form = formEl([['Customer name', 'text', 'customer'], ['Pickup address', 'text', 'pickup'], ['Delivery address', 'text', 'delivery'], ['Total price', 'number', 'total']]);
      card.appendChild(form);
      const footer = el('div', 'footer');
      const cancel = el('button', 'btn', 'Cancel'); cancel.addEventListener('click', closeModal);
      const create = el('button', 'btn primary', 'Create');
      create.addEventListener('click', () => {
        const c = form.customer.value.trim(); if (!c) { alert('Enter name'); return }
        const p = form.pickup.value.trim(); const d = form.delivery.value.trim(); const t = parseFloat(form.total.value) || 0;
        const o = { id: uid('ORD-'), customerName: c, pickup: p, delivery: d, status: 'pending', items: [], total: t }; state.orders.push(o); saveDebounced(); closeModal(); render();
      });
      footer.appendChild(cancel); footer.appendChild(create); card.appendChild(footer);
    }
    if (state.modal.type === 'new-driver') {
      card.appendChild(el('h3', null, 'Add Driver'));
      const form = formEl([['Name', 'text', 'name'], ['Phone', 'text', 'phone'], ['Vehicle', 'text', 'vehicle']]);
      card.appendChild(form);
      const footer = el('div', 'footer');
      const cancel = el('button', 'btn', 'Cancel'); cancel.addEventListener('click', closeModal);
      const create = el('button', 'btn primary', 'Add');
      create.addEventListener('click', () => {
        const n = form.name.value.trim(); if (!n) { alert('Enter name'); return }
        state.drivers.push({ id: uid('DRV-'), name: n, phone: form.phone.value, vehicle: form.vehicle.value, status: 'available', rating: 5 }); saveDebounced(); closeModal(); render();
      });
      footer.appendChild(cancel); footer.appendChild(create); card.appendChild(footer);
    }
    if (state.modal.type === 'assign') {
      const order = state.orders.find(o => o.id === state.modal.orderId);
      card.appendChild(el('h3', null, 'Assign Driver'));
      card.appendChild(el('div', 'small', 'Order: ' + (order ? order.customerName : '#' + state.modal.orderId)));
      const sel = el('select', 'input');
      const avail = state.drivers.filter(d => d.status === 'available');
      if (!avail.length) sel.appendChild(new Option('No available drivers', ''));
      avail.forEach(d => sel.appendChild(new Option(d.name + ' — ' + d.vehicle, d.id)));
      card.appendChild(sel);
      const footer = el('div', 'footer');
      const cancel = el('button', 'btn', 'Cancel'); cancel.addEventListener('click', closeModal);
      const ok = el('button', 'btn primary', 'Assign'); ok.addEventListener('click', () => {
        const driverId = sel.value; if (!driverId) { alert('Choose driver'); return }
        const drv = state.drivers.find(d => d.id === driverId); if (drv) { drv.status = 'busy'; drv.activeOrderId = state.modal.orderId }
        const ord = state.orders.find(o => o.id === state.modal.orderId); if (ord) { ord.driverId = driverId; ord.status = 'assigned' }
        saveDebounced();
        closeModal(); render();
      });
      footer.appendChild(cancel); footer.appendChild(ok); card.appendChild(footer);
    }
    if (state.modal.type === 'driver-map') {
      const drv = state.drivers.find(d => d.id === state.modal.driverId);
      card.appendChild(el('h3', null, 'Driver Location'));
      if (!drv) { card.appendChild(el('div', 'empty', 'Driver not found')); }
      else {
        card.appendChild(el('div', null, drv.name));
        const mapWrap = el('div', 'map-container');
        const mapEl = el('div'); mapEl.id = 'map'; mapWrap.appendChild(mapEl);
        card.appendChild(mapWrap);
        const coordsRow = el('div', 'form-row');
        coordsRow.appendChild(el('div', null, 'Latitude')); const latIn = document.createElement('input'); latIn.className = 'input'; latIn.value = drv.currentLocation && drv.currentLocation.lat ? String(drv.currentLocation.lat) : '40.7128';
        coordsRow.appendChild(latIn);
        coordsRow.appendChild(el('div', null, 'Longitude')); const lngIn = document.createElement('input'); lngIn.className = 'input'; lngIn.value = drv.currentLocation && drv.currentLocation.lng ? String(drv.currentLocation.lng) : '-74.0060';
        coordsRow.appendChild(lngIn);
        card.appendChild(coordsRow);
        const footer2 = el('div', 'footer');
        const cancel2 = el('button', 'btn', 'Close'); cancel2.addEventListener('click', closeModal);
        const saveLoc = el('button', 'btn primary', 'Update Location'); saveLoc.addEventListener('click', () => {
          const lat = parseFloat(latIn.value); const lng = parseFloat(lngIn.value);
          if (isNaN(lat) || isNaN(lng)) { alert('Invalid coordinates'); return }
          drv.currentLocation = { lat, lng }; saveDebounced(); closeModal(); render();
        });
        footer2.appendChild(cancel2); footer2.appendChild(saveLoc); card.appendChild(footer2);
        // initialize Leaflet map after DOM insertion
        setTimeout(() => {
          try {
            const lat = parseFloat(latIn.value); const lng = parseFloat(lngIn.value);
            const map = L.map('map').setView([lat, lng], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
            L.marker([lat, lng]).addTo(map);
          } catch (err) { console.warn('map init failed', err) }
        }, 50);
      }
    }

    m.appendChild(card); parent.appendChild(m);
  }

  // Filtering and helpers
  function filteredOrders() {
    const q = (state.q || '').toLowerCase().trim();
    if (!q) return state.orders.slice();
    return state.orders.filter(o => {
      return o.customerName.toLowerCase().includes(q) || (o.id || '').toLowerCase().includes(q) || (o.pickup || '').toLowerCase().includes(q) || (o.delivery || '').toLowerCase().includes(q) || (o.driverId || '').toLowerCase().includes(q);
    });
  }

  function markDelivered(orderId) {
    const ord = state.orders.find(o => o.id === orderId);
    if (ord) { ord.status = 'delivered'; save(); render(); }
  }

  // Export / Import / Reset
  function exportJSON() {
    const data = { orders: state.orders, drivers: state.drivers };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'delivery-app-export.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  function exportCSV() {
    // export orders as CSV
    const header = ['id', 'customerName', 'pickup', 'delivery', 'status', 'driverId', 'total'];
    const rows = state.orders.map(o => header.map(h => `"${String(o[h] || '').replace(/"/g, '""')}"`).join(','));
    const csv = [header.join(',')].concat(rows).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'orders.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  function triggerImport() {
    const input = document.getElementById('importFile');
    if (!input) return alert('Import control not found');
    input.onchange = (ev) => {
      const f = ev.target.files[0]; if (!f) return; const reader = new FileReader();
      reader.onload = (e) => {
        try { const data = JSON.parse(e.target.result); state.orders = data.orders || []; state.drivers = data.drivers || []; save(); render(); alert('Import successful'); }
        catch (err) { alert('Invalid file'); }
      };
      reader.readAsText(f);
    };
    input.click();
  }

  function triggerImportCSV() {
    const input = document.getElementById('importCSV');
    if (!input) return alert('Import control not found');
    input.onchange = (ev) => {
      const f = ev.target.files[0]; if (!f) return; const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const lines = text.split(/\r?\n/).filter(Boolean);
          const header = lines.shift().split(',').map(h => h.replace(/\"/g, '').trim());
          const rows = lines.map(l => {
            // basic CSV split (no full RFC parsing)
            const parts = l.split(',').map(p => p.replace(/^"|"$/g, '').trim());
            const obj = {};
            header.forEach((h, i) => obj[h] = parts[i]);
            return obj;
          });
          // map rows to orders
          state.orders = rows.map(r => ({ id: r.id || uid('ORD-'), customerName: r.customerName || '', pickup: r.pickup || '', delivery: r.delivery || '', status: r.status || 'pending', driverId: r.driverId || '', total: parseFloat(r.total) || 0, items: [] }));
          saveDebounced(); render(); alert('CSV import complete');
        } catch (err) { console.error(err); alert('CSV import failed'); }
      };
      reader.readAsText(f);
    };
    input.click();
  }

  function resetData() {
    if (!confirm('Reset app data to sample state? This clears local changes.')) return;
    localStorage.removeItem('delivery_app_state'); state.orders = []; state.drivers = []; seed(); save(); render();
  }

  // UI helpers
  function openAssign(orderId) { state.modal = { type: 'assign', orderId }; render(); }
  function openNewOrder() { state.modal = { type: 'new-order' }; render(); }
  function openNewDriver() { state.modal = { type: 'new-driver' }; render(); }
  function closeModal() { state.modal = null; render(); }

  function statCard(title, value) { const c = el('div', 'card'); c.appendChild(el('div', 'small', title)); c.appendChild(el('div', null, String(value))); return c }
  function spacer() { const s = el('div'); s.style.height = '16px'; return s }

  function formEl(rows) {
    const f = document.createElement('div'); rows.forEach(r => {
      const row = el('div', 'form-row'); row.appendChild(el('div', null, r[0]));
      let input;
      if (r[1] === 'text' || r[1] === 'number') input = document.createElement('input');
      else input = document.createElement('textarea');
      input.className = 'input'; input.type = r[1]; input.name = r[2]; row.appendChild(input); f.appendChild(row);
      f[r[2]] = input;
    });
    return f;
  }

  function el(tag, cls, txt) { const e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e }
  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1) }

  // Init
  seed(); render();
  // Expose for debugging
  window._appState = state;
})();