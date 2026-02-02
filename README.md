# 🎵 Bandcamper

A modern web application to analyze your Bandcamp sales data with beautiful visualizations. Upload your sales reports and get instant insights into your best-performing releases and tracks.

## ✨ Features

- **📤 CSV Upload** - Import sales data from Bandcamp artist dashboard
- **📊 Sales Analytics** - View total sales, revenue, and track statistics
- **🎯 Top Releases** - Visualize best-performing albums with interactive charts
- **🎵 Top Tracks** - Analyze track performance across all releases
- **💰 Revenue Tracking** - Monitor earnings and sales trends
- **🔄 Real-time Updates** - Dashboard refreshes instantly after uploads
- **📱 Responsive Design** - Works seamlessly on desktop and mobile

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm (or yarn/pnpm)

### Setup & Development (Client-only)

This project now runs entirely in the browser — there is no backend required. CSV parsing and analytics are performed locally in your browser using PapaParse.

1. **Clone and navigate to project:**
```bash
cd /Users/oleksandrnikiienko/Projects/bandcamper
```

2. **Install and run the frontend only:**
```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`. Open that URL in your browser and upload your Bandcamp CSV file.

### Building for Production

The frontend is a static site and can be deployed to Netlify. Build the production bundle with:

```bash
cd frontend
npm run build
```

Deploy the contents of `frontend/dist` to Netlify (or any static host). There is no backend to deploy.

## 📊 How to Use

1. **Export from Bandcamp:**
   - Go to your Bandcamp artist dashboard
   - Download your sales report as CSV

2. **Upload CSV:**
   - Click "Choose CSV File" button
   - Select your downloaded CSV file
   - Wait for processing confirmation

3. **View Analytics:**
   - See summary statistics (total sales, revenue)
   - Explore top releases with horizontal bar charts
   - Analyze top tracks across all releases
   - Sort by sales count or revenue

## 🏗️ Project Structure

```
bandcamper/
├── backend/                    # Node.js + Express server
│   ├── src/
│   │   ├── db/               # SQLite database setup
│   │   ├── routes/           # API endpoints
│   │   ├── utils/            # CSV parser
│   │   ├── middleware/       # Error handling
│   │   └── index.ts          # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # React + TypeScript app
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API client
│   │   ├── types/           # TypeScript types
│   │   ├── styles/          # CSS files
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
└── README.md                   # This file
```

## 🔌 API Endpoints

All endpoints are prefixed with `/api/sales`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload and process CSV file |
| GET | `/releases` | Get all releases |
| GET | `/releases/top/:limit` | Get top N releases by sales |
| GET | `/releases/:id/tracks` | Get tracks for a release |
| GET | `/tracks/top/:limit` | Get top N tracks |
| GET | `/summary` | Get summary statistics |
| POST | `/clear` | Clear all data |

## 📝 CSV Format

Bandcamp exports should contain columns like:
- `Item Title` - Release name, track name, or bundle name
- `Unit Price` - Price per unit
- `Quantity` - Number of units sold
- Additional metadata (dates, etc.)

The parser intelligently handles Bandcamp's CSV format variations.

## 🎨 Tech Stack

**Backend:**
- Node.js + Express.js
- TypeScript
- SQLite3 (zero-config database)
- CSV parsing with csv-parse

**Frontend:**
- React 18
- TypeScript
- Vite (build tool)
- Recharts (visualization)
- Axios (HTTP client)

## 📦 Deployment with Netlify

1. **Build frontend:**
```bash
cd frontend
npm run build
```

2. **Deploy to Netlify:**
   - Connect your GitHub repo to Netlify
   - Set build command: `cd frontend && npm run build`
   - Set publish directory: `frontend/dist`
   - Deploy

3. **Deploy backend:**
   - Use Railway, Render, Fly.io, or another Node.js host
   - Set `DATABASE_PATH` environment variable
   - Update frontend API URL in `vite.config.ts` proxy configuration

## 🛠️ Development Tips

- **Hot reload:** Both frontend and backend support hot reload during development
- **Database:** SQLite stores data in `/backend/data/bandcamper.db`
- **CORS:** Already configured for local development
- **Environment variables:** Copy `.env.example` to `.env` if needed

## 📄 License

MIT - Feel free to use and modify

## 🤝 Contributing

Have suggestions or found an issue? Feel free to contribute!

---

Built with ❤️ for Bandcamp artists
