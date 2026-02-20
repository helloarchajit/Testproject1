import os
import sys
from flask import Flask, render_template, request, jsonify
from datetime import datetime
import json

app = Flask(__name__, template_folder='templates', static_folder='static')

# In-memory database
orders = []
drivers = []
next_order_id = 1
next_driver_id = 1

# Sample data
def init_data():
    global drivers, orders, next_driver_id, next_order_id
    
    drivers = [
        {
            'id': 1,
            'name': 'John Smith',
            'phone': '555-0101',
            'vehicle': 'Honda Civic',
            'status': 'available',
            'rating': 4.8
        },
        {
            'id': 2,
            'name': 'Maria Garcia',
            'phone': '555-0102',
            'vehicle': 'Toyota Camry',
            'status': 'available',
            'rating': 4.9
        },
        {
            'id': 3,
            'name': 'Alex Johnson',
            'phone': '555-0103',
            'vehicle': 'Ford Transit',
            'status': 'available',
            'rating': 4.7
        }
    ]
    next_driver_id = 4
    
    orders = [
        {
            'id': 1,
            'customer_name': 'Alice Wilson',
            'pickup_address': '123 Main St, New York, NY',
            'delivery_address': '456 Oak Ave, New York, NY',
            'status': 'pending',
            'total_price': 25.99,
            'items': 1,
            'created_at': datetime.now().isoformat()
        },
        {
            'id': 2,
            'customer_name': 'Bob Brown',
            'pickup_address': '789 Pine Rd, New York, NY',
            'delivery_address': '321 Elm St, New York, NY',
            'status': 'in-transit',
            'driver_id': 1,
            'total_price': 89.99,
            'items': 2,
            'created_at': datetime.now().isoformat()
        }
    ]
    next_order_id = 3

@app.route('/')
def index():
    pending = len([o for o in orders if o['status'] == 'pending'])
    delivered = len([o for o in orders if o['status'] == 'delivered'])
    available_drivers = len([d for d in drivers if d['status'] == 'available'])
    
    return render_template('index.html', 
                         total_orders=len(orders),
                         pending_orders=pending,
                         delivered_orders=delivered,
                         available_drivers=available_drivers,
                         orders=orders,
                         drivers=drivers)

@app.route('/api/orders', methods=['GET', 'POST'])
def manage_orders():
    global next_order_id
    
    if request.method == 'POST':
        data = request.json
        new_order = {
            'id': next_order_id,
            'customer_name': data.get('customer_name'),
            'pickup_address': data.get('pickup_address'),
            'delivery_address': data.get('delivery_address'),
            'status': 'pending',
            'total_price': float(data.get('total_price', 0)),
            'items': 1,
            'created_at': datetime.now().isoformat()
        }
        orders.append(new_order)
        next_order_id += 1
        return jsonify(new_order), 201
    
    return jsonify(orders)

@app.route('/api/orders/<int:order_id>/assign', methods=['POST'])
def assign_driver(order_id):
    data = request.json
    driver_id = data.get('driver_id')
    
    order = next((o for o in orders if o['id'] == order_id), None)
    driver = next((d for d in drivers if d['id'] == driver_id), None)
    
    if order and driver:
        order['driver_id'] = driver_id
        order['status'] = 'assigned'
        driver['status'] = 'busy'
        driver['active_order_id'] = order_id
        return jsonify({'success': True, 'message': 'Driver assigned'})
    
    return jsonify({'success': False}), 400

@app.route('/api/drivers', methods=['GET', 'POST'])
def manage_drivers():
    global next_driver_id
    
    if request.method == 'POST':
        data = request.json
        new_driver = {
            'id': next_driver_id,
            'name': data.get('name'),
            'phone': data.get('phone'),
            'vehicle': data.get('vehicle'),
            'status': 'available',
            'rating': 5.0
        }
        drivers.append(new_driver)
        next_driver_id += 1
        return jsonify(new_driver), 201
    
    return jsonify(drivers)

if __name__ == '__main__':
    init_data()
    port = 5000
    print(f"\n🚚 Delivery App running at http://localhost:{port}")
    print(f"Press CTRL+C to stop the server\n")
    app.run(debug=True, port=port, use_reloader=False)
