Delivery Management App
A modern delivery management dashboard application featuring order tracking, driver management, and real-time mapping.

Features
Dashboard: Overview of orders and driver status.
Order Management: Create, assign, and track orders.
Driver Management: Manage driver profiles and availability.
Interactive Maps: Visualize driver locations and routes.
Quick Start (Static Preview)
This project includes a standalone static version that runs without any complex dependencies.

Windows
Double-click open_preview.bat or run the PowerShell script:

.\serve.ps1
Then open http://localhost:3000.

Development (Source Code)
The full source code allows for backend integration and further development.

Frontend (Next.js)
Requires Node.js.

npm install
npm run dev
Backend (Python Flask)
Requires Python.

pip install -r requirements.txt
python app.py
Project Structure
index.html & app.js: Standalone static preview version.
src/: Next.js source code (React + TypeScript).
app.py: Flask backend server (optional).
