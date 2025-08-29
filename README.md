# Website Traffic Counter Analyzer

A real-time website traffic analytics tool built with the MERN stack (MongoDB, Express.js, React.js, Node.js). Track visitor statistics, analyze user behavior, and gain insights into your website's performance.

## Features

- Real-time visitor tracking
- Unique visitor identification
- Session duration tracking
- Bounce rate analysis
- Historical data visualization
- Detailed daily insights
- Comprehensive metric explanations

## Tech Stack

- Frontend: React.js
- Backend: Node.js with Express.js
- Database: MongoDB
- Additional Tools: React Router, Morgan for logging

## Installation

1. Clone the repository:
```bash
git clone https://github.com/sanjaypc-github/Website-visitor-counter.git
cd Website-visitor-counter
```

2. Install dependencies for frontend:
```bash
npm install
```

3. Install dependencies for backend:
```bash
cd backend
npm install
```

4. Create .env file in backend directory with:
```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

5. Start the backend server:
```bash
cd backend
npm start
```

6. Start the frontend (in a new terminal):
```bash
npm start
```

## Usage

1. Main Dashboard:
   - View total visits
   - Track unique visitors
   - Monitor average view time
   - See new visitor count

2. Insights Page:
   - Access detailed daily statistics
   - View bounce rates
   - Analyze user behavior
   - Understand metric definitions

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Deploy backend to Render

This repo includes a Render Blueprint (`render.yaml`) to deploy the backend.

Steps:

1. Create a MongoDB database (e.g., MongoDB Atlas) and copy its connection string.
2. Push your latest changes to GitHub.
3. In Render, create a new Blueprint and select this repository. Render will detect `render.yaml`.
4. Set environment variables for the service:
   - `MONGODB_URI`: your MongoDB connection string
   - `NODE_ENV`: `production`
5. Render will build (`npm install`) and start (`node server.js`) the backend under `backend/`.
6. After it’s live, note the service URL (e.g., `https://<service>.onrender.com`).

Frontend configuration:

1. In the project root, create a `.env` file with:
```
REACT_APP_API_URL=https://<service>.onrender.com
```
2. Rebuild and deploy the frontend:
```
npm run build
npm run deploy
```
Your GitHub Pages site will now call the deployed backend.
