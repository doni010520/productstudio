# ProductStudio

AI-powered product photography background replacement platform.

## Features

- 🎨 15 pre-defined professional background styles
- 🤖 DALL-E 3 integration for high-quality background generation
- 🔐 JWT authentication system
- 💳 Credit-based pricing system
- 📊 User dashboard with generation history
- 🎭 Dark blue glassmorphism UI

## Tech Stack

**Frontend:**
- React 18 + Vite
- TailwindCSS
- Framer Motion
- React Router

**Backend:**
- Node.js + Express
- PostgreSQL
- JWT Authentication
- Multer (file upload)
- Sharp (image processing)

**APIs:**
- OpenAI DALL-E 3
- Clipdrop (background removal)

## Project Structure

```
productstudio/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Utilities
│   │   └── App.jsx
│   ├── public/
│   └── package.json
├── server/                # Backend API
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── server.js
│   ├── uploads/          # Temporary upload directory
│   └── package.json
├── database/             # Database migrations
└── docker-compose.yml    # For local development
```

## Environment Variables

### Server (.env)
```
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/productstudio
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-key
CLIPDROP_API_KEY=your-clipdrop-key
CLIENT_URL=http://localhost:5173
```

### Client (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Installation

1. Clone the repository
2. Install dependencies:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up PostgreSQL database
4. Run migrations
5. Start development servers:

```bash
# Start server (from server directory)
npm run dev

# Start client (from client directory)
npm run dev
```

## Deployment (Easypanel)

1. Push to GitHub
2. Connect repository to Easypanel
3. Configure environment variables
4. Deploy!

## Credits System

- Each background generation costs credits
- API costs are passed to customers with markup
- Configurable pricing per generation

## License

Proprietary - All rights reserved
