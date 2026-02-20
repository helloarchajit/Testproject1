function switchTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all nav buttons
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

function showOrderForm() {
    document.getElementById('orderModal').classList.add('show');
}

function closeOrderForm() {
    document.getElementById('orderModal').classList.remove('show');
    document.getElementById('orderForm').reset();
}

function showDriverForm() {
    document.getElementById('driverModal').classList.add('show');
}

function closeDriverForm() {
    document.getElementById('driverModal').classList.remove('show');
    document.getElementById('driverForm').reset();
}

function closeAssignForm() {
    document.getElementById('assignModal').classList.remove('show');
}

// Form Submissions
document.getElementById('orderForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const orderData = {
        customer_name: document.getElementById('customerName').value,
        pickup_address: document.getElementById('pickupAddress').value,
        delivery_address: document.getElementById('deliveryAddress').value,
        total_price: document.getElementById('totalPrice').value
    };
    
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        
        if (response.ok) {
            alert('Order created successfully!');
            closeOrderForm();
            location.reload();
        }
    } catch (error) {
        alert('Error creating order: ' + error);
    }
});

document.getElementById('driverForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const driverData = {
        name: document.getElementById('driverName').value,
        phone: document.getElementById('driverPhone').value,
        vehicle: document.getElementById('vehicleType').value
    };
    
    try {
        const response = await fetch('/api/drivers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(driverData)
        });
        
        if (response.ok) {
            alert('Driver added successfully!');
            closeDriverForm();
            location.reload();
        }
    } catch (error) {
        alert('Error adding driver: ' + error);
    }
});

function assignDriver(orderId) {
    fetch('/api/drivers')
        .then(response => response.json())
        .then(drivers => {
            const availableDrivers = drivers.filter(d => d.status === 'available');
            const driversDiv = document.getElementById('availableDrivers');
            driversDiv.innerHTML = '';
            
            if (availableDrivers.length === 0) {
                driversDiv.innerHTML = '<p>No available drivers</p>';
            } else {
                availableDrivers.forEach(driver => {
                    const driverDiv = document.createElement('div');
                    driverDiv.className = 'driver-option';
                    driverDiv.innerHTML = `
                        <div>
                            <strong>${driver.name}</strong>
                            <p>${driver.vehicle}</p>
                            <p>⭐ ${driver.rating}</p>
                        </div>
                        <button class="btn btn-primary btn-small" 
                            onclick="confirmAssign(${orderId}, ${driver.id})">Assign</button>
                    `;
                    driversDiv.appendChild(driverDiv);
                });
            }
            
            document.getElementById('assignModal').classList.add('show');
        });
}

async function confirmAssign(orderId, driverId) {
    try {
        const response = await fetch(`/api/orders/${orderId}/assign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ driver_id: driverId })
        });
        
        if (response.ok) {
            alert('Driver assigned successfully!');
            closeAssignForm();
            location.reload();
        }
    } catch (error) {
        alert('Error assigning driver: ' + error);
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const orderModal = document.getElementById('orderModal');
    const driverModal = document.getElementById('driverModal');
    const assignModal = document.getElementById('assignModal');
    
    if (event.target === orderModal) {
        closeOrderForm();
    }
    if (event.target === driverModal) {
        closeDriverForm();
    }
    if (event.target === assignModal) {
        closeAssignForm();
    }
}
