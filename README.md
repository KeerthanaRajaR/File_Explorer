# File Explorer

A web-based file explorer application with a Node.js backend and React frontend. It allows users to browse, view, and manage files and folders on the server.

## Features
- Browse files and folders
- View file contents (text, images)
- Create, rename, and delete files/folders
- Responsive UI
- REST API backend

## Folder Structure
```
file-explorer/
├── backend/
│   ├── index.js           # Node.js backend server
│   ├── package.json       # Backend dependencies
│   └── files/             # Sample files and folders
│       ├── sample.txt
│       ├── docs/
│       │   └── readme.md
│       ├── document/
│       ├── images/
│       ├── new folder/
│       │   └── readme.md
│       ├── pic/
│       └── Picture/
├── frontend/
│   ├── package.json       # Frontend dependencies
│   ├── build/             # Production build
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js         # Main React component
│       ├── App.css        # Styles
│       └── index.js       # Entry point
└── README.md              # Project documentation
```

## Getting Started

### Prerequisites
- Node.js (v14+)
- npm

### Backend Setup
1. Navigate to the backend folder:
	```bash
	cd backend
	```
2. Install dependencies:
	```bash
	npm install
	```
3. Start the backend server:
	```bash
	node index.js
	```

### Frontend Setup
1. Navigate to the frontend folder:
	```bash
	cd frontend
	```
2. Install dependencies:
	```bash
	npm install
	```
3. Start the frontend development server:
	```bash
	npm start
	```

### Accessing the App
- Open your browser and go to `http://localhost:3000` for the frontend.
- Backend runs on `http://localhost:5000` (or as configured).

## API Endpoints
- `GET /files` — List files and folders
- `GET /files/:path` — Get file contents
- `POST /files` — Create file/folder
- `PUT /files/:path` — Rename file/folder
- `DELETE /files/:path` — Delete file/folder

## Technologies Used
- Node.js
- Express.js
- React
- CSS

