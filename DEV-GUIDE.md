# Development Guide - Local Data Lister

## Quick Start

This project now uses **React + Vite** for the frontend and **Node.js + Express** for the backend.

### 1. Start Backend Server

```bash
npm run server
# or
node server/index.js
```

### 2. Start Frontend (React)

```bash
npm run dev
# or
npx vite
```

### 3. Full Setup (Database + Backend)

```bash
npm run setup
```

## Application URLs

- **React Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

## Project Structure

```
local-data-lister/
├── src/                    # React source files
│   ├── App.tsx            # Main React component
│   ├── main.tsx           # React entry point
│   └── App.css            # React styles
├── server/                # Backend files
│   ├── index.js           # Express server
│   ├── db.js              # Database connection
│   └── add-new-places.js  # Database seeding
├── package.json           # Root package.json (React)
├── vite.config.ts         # Vite configuration
└── index.html             # HTML template for React
```

## Development Workflow

1. **Backend Development**: Edit files in `server/`
2. **Frontend Development**: Edit files in `src/`
3. **Database Changes**: Modify `server/add-new-places.js`

## Removed Files

The following vanilla JavaScript files have been removed:

- Root `index.html` (replaced by React version)
- Root `styles.css` (replaced by `src/App.css`)
- Root `script.js` (replaced by React components)
- `debug.js` (no longer needed)
