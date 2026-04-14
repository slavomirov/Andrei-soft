🚗 Andrei Soft – Engine Head Repair Service Management Platform

📌 Overview

Andrei Soft is a full-stack web application designed to manage a specialized automotive service focused on engine head (cylinder head) repair.

The platform digitizes and streamlines the entire workflow — from order intake to repair tracking and delivery — with an emphasis on real-time updates, data consistency, and process automation.

🧩 Core Features
🧾 Order Management – create, update, and track repair orders
👨‍🔧 Workflow Tracking – monitor each stage of the repair process
👥 Customer Management – maintain client history and records
📊 Repair History & Audit Trail
🔄 Real-time Updates via SignalR
🔐 Authentication & Authorization using JWT
🤖 AI-assisted features (analysis, suggestions, automation)
📦 Status Management (pending, in progress, completed, etc.)
🛠️ Tech Stack
Backend
⚙️ C#
🧱 .NET 8 (ASP.NET Core Web API)
🔐 JWT Authentication
🔌 SignalR (real-time communication)
🗄️ MS SQL Server
Frontend
⚛️ React
🌐 RESTful API integration
🏗️ Architecture

The system follows a modern client-server architecture:

[ React Frontend ]
        ↓
[ ASP.NET Core API ]
        ↓
[ MS SQL Database ]

Additional layer:

⚡ SignalR Hub for real-time bidirectional communication
Key Concepts
Stateless REST API
Token-based authentication (JWT)
Event-driven updates via WebSockets (SignalR)
Separation of concerns (frontend/backend)
🔐 Authentication & Security
JWT-based authentication
Protected API endpoints
Supports role-based access control (extendable)
📡 Real-time Communication

SignalR is used to:

Push live updates to connected clients
Broadcast order status changes
Enable reactive UI without polling

🗄️ Database Design
MS SQL Server is used for persistent storage.

Typical entities include:
Customers
Orders
Repairs
Statuses
