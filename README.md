# File Explorer

A modern web-based file explorer application with a Node.js backend and React frontend. It allows users to browse, view, and manage files and folders with an intuitive, feature-rich interface.

## Project Structure
```
file-explorer/
├── backend/
│   ├── index.js           # Node.js backend server
│   ├── package.json       # Backend dependencies
│   ├── routes/
│   │   └── fileRoutes.js  # API endpoints for files/folders
│   ├── services/
│   │   └── fileService.js # Business logic for file/folder operations
│   ├── utils/
│   │   └── helpers.js     # Helper functions
│   └── files/             # Sample files and folders
├── frontend/
│   ├── package.json       # Frontend dependencies
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js         # Main application orchestrator
│   │   ├── App.css        # Styles
│   │   ├── index.js       # Entry point
│   │   ├── components/    # UI Components
│   │   │   ├── ContextMenu.js         # Right-click context menu
│   │   │   ├── ExplorerHeader.js      # Top header with actions
│   │   │   ├── ExplorerMainContent.js # Main file area + preview
│   │   │   ├── ExplorerNavBar.js      # Breadcrumbs + search
│   │   │   ├── ExplorerToolbar.js     # Selection + filter controls
│   │   │   ├── FileItem.js            # Individual file/folder item
│   │   │   ├── ImageViewerModal.js    # Full-screen image viewer
│   │   │   ├── NewFolderDialog.js     # Create folder dialog
│   │   │   ├── PreviewPanel.js        # File preview panel
│   │   │   ├── PropertiesDialog.js    # File properties dialog
│   │   │   └── RenameDialog.js        # Rename item dialog
│   │   ├── hooks/         # Custom React Hooks
│   │   │   ├── useExplorerLifecycle.js   # Lifecycle & navigation
│   │   │   ├── useExplorerItemActions.js # CRUD & file operations
│   │   │   └── useExplorerShortcuts.js   # Keyboard shortcuts
│   │   ├── services/
│   │   │   └── fileService.js # API communication layer
│   │   └── utils/
│   │       ├── fileUtils.js   # File-related utilities
│   │       └── helpers.js     # General helper functions
└── README.md              # Project documentation
```

## Features

### Core Functionality
- 📁 Browse files and folders with breadcrumb navigation
- 👀 Preview text files and images inline
- ✏️ Create, rename, and delete files/folders
- 📋 Copy/Cut/Paste operations with clipboard support
- 🎨 Image viewer with full-screen mode
- 🔍 Search and filter files by type
- 📊 Sort by name, size, or date
- 🌓 Dark mode support
- 📱 Responsive grid and list views

### Advanced Features
- Drag & drop file upload
- Bulk operations (multi-select delete)
- File properties viewer with metadata
- Storage usage indicator
- Keyboard shortcuts (Ctrl+A, Ctrl+C, Ctrl+V, Delete, Escape)
- Context menu with rich actions
- AI-powered background removal (using rembg-node)

## Architecture & Design

### Modular Frontend Architecture
The frontend follows a **highly modular architecture** with clear separation of concerns:

- **Components** - 11 specialized UI components, each with a single responsibility
- **Custom Hooks** - Business logic extracted into reusable hooks:
  - `useExplorerLifecycle` - Handles initialization, effects, and navigation
  - `useExplorerItemActions` - Manages all CRUD operations and file interactions
  - `useExplorerShortcuts` - Centralized keyboard shortcut handling
- **Services** - API communication layer abstraction
- **Utils** - Pure helper functions for formatting and data transformation

### Benefits
- **Testability** - Each hook and component can be tested independently
- **Maintainability** - Changes are localized to specific modules
- **Reusability** - Components and hooks can be reused across the app
- **Readability** - Clear code organization with ~280 lines in App.js (down from 900+)
- **Performance** - Optimized with useMemo and useCallback hooks

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

### File Operations
- `GET /api/browse?path=<path>` - List files and folders at path
- `GET /api/file-content?path=<path>` - Get file contents
- `GET /api/download?path=<path>` - Download a file
- `POST /api/create-folder` - Create a new folder
- `POST /api/upload` - Upload files
- `POST /api/rename` - Rename file/folder
- `POST /api/delete` - Delete file/folder
- `POST /api/paste` - Copy/Move items
- `POST /api/remove-bg` - AI background removal for images

### System
- `GET /storage` - Get storage information (used/total space)
- `PUT /files/:path` — Rename file/folder
- `DELETE /files/:path` — Delete file/folder

## Technologies Used
- Node.js
- Express.js
- React
- CSS

## Demo Video

https://github.com/user-attachments/assets/325df175-a714-4a8b-9101-4aef09860747


