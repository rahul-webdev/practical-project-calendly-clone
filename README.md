# Schedulr - Calendly Clone

A full-stack scheduling platform built with the MERN stack (MongoDB, Express, React, Node.js), featuring smart scheduling, time zone detection, and team coordination.

## 🚀 Features

- **Smart Scheduling**: Set your availability once and let others book time with you effortlessly.
- **Time Zone Detection**: Automatically detect and convert time zones for seamless global scheduling.
- **Team Coordination**: Schedule meetings with multiple team members simultaneously.
- **Shareable Links**: Generate unique booking links to share with clients and colleagues.
- **Secure Authentication**: JWT-based authentication with protected routes.
- **API Security**: Versioned API (`/api/v1`) with mandatory API Key and Version headers.
- **End-to-End Encryption**: Secure communication using AES-256-CBC for all requests and responses.
- **Rate Limiting & Security**: IP-based rate limiting, Helmet, and CORS protection.
- **Modern UI**: Built with React, Tailwind CSS, and Shadcn UI for a sleek, responsive experience.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://reactjs.org/) with [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **State Management**: [React Query (TanStack)](https://tanstack.com/query/latest)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **Security**: [Crypto-JS](https://github.com/brix/crypto-js) for end-to-end encryption

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: [JWT (JSON Web Tokens)](https://jwt.io/) & [Bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Middleware**: Morgan, Helmet, CORS, Compression, [Express Rate Limit](https://github.com/express-rate-limit/express-rate-limit)
- **Security**: AES-256-CBC Encryption, API Key Verification

---

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (>= 18)
- MongoDB (Local or Atlas)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd calendly-clone
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Create a `.env` file in the `backend/` directory and copy the contents from `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. **Important**: Add your MongoDB URL in the `.env` file:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/schedulr?retryWrites=true&w=majority
   ```
5. Start the backend server:
   ```bash
   npm run dev
   ```
   The backend will run on [http://localhost:4000](http://localhost:4000).

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The frontend will run on [http://localhost:8080](http://localhost:8080).

---

## 📁 Project Structure

```text
calendly-clone/
├── backend/                # Express API
│   ├── src/
│   │   ├── config/         # Database & Env config
│   │   ├── middleware/     # Auth, Error, Security, Encryption
│   │   ├── models/         # Mongoose Schemas
│   │   ├── routes/         # API Endpoints
│   │   ├── utils/          # JWT & Crypto helpers
│   │   └── index.js        # Entry point
│   └── .env.example        # Env template
└── frontend/               # React Application
    ├── src/
    │   ├── components/     # UI & Layout components
    │   ├── pages/          # Application views
    │   ├── hooks/          # Custom React hooks
    │   ├── service/        # API & Crypto service
    │   └── vite.config.ts  # Vite configuration
```

## 🔐 Environment Variables

### Backend (`/backend/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Backend server port | `4000` |
| `NODE_ENV` | Environment mode | `development` |
| `FRONTEND_URL`| Frontend application URL | `http://localhost:8080` |
| `MONGO_URI` | **Required**: MongoDB connection string | `-` |
| `JWT_SECRET` | Secret key for JWT signing | `your_secret_key` |
| `API_VERSION` | API version prefix | `v1` |
| `API_KEY` | Mandatory API Key for all requests | `calendly_clone_secret_key` |
| `API_ENCRYPTION_KEY` | 32-char key for AES-256-CBC encryption | `calendly_clone_encryption_key_32` |

### Frontend (`/frontend/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Backend server URL | `http://localhost:4000` |
| `VITE_API_VERSION` | API version prefix | `v1` |
| `VITE_API_KEY` | Mandatory API Key for all requests | `calendly_clone_secret_key` |
| `VITE_API_ENCRYPTION_KEY` | 32-char key for AES-256-CBC encryption | `calendly_clone_encryption_key_32` |

---

## 🧪 Testing

### Frontend
To run vitest tests:
```bash
cd frontend
npm run test
```

---

## 📄 License
This project is licensed under the MIT License.
