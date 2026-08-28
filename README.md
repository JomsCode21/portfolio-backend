# Portfolio API

The Node.js, Express, MongoDB, and TypeScript API for Jhumari Job Galos’ portfolio. It manages portfolio content, administrator authentication, and contact messages.

## Stack

- Node.js and Express
- TypeScript
- MongoDB and Mongoose
- JWT authentication
- bcrypt password hashing

## Requirements

- Node.js 20 or newer
- MongoDB Atlas or a local MongoDB instance

## Installation

```bash
npm install
```

Create `.env` from `.env.example` and fill in your values:

```env
PORT=5000
MONGO_URI=yourdatabaseURL
JWT_SECRET=use_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=use_a_secure_password
NODE_ENV=development
```

Never commit `.env`. Encode special characters in `DATABASE_PASSWORD` when they are used in `MONGO_URI`.

## First administrator

After MongoDB is reachable, create the initial administrator account:

```bash
npm run seed:admin
```

Use `ADMIN_EMAIL` and `ADMIN_PASSWORD` to sign in through the frontend at `/admin/login`.

## Scripts

```bash
npm run dev          # Start the TypeScript API in watch mode
npm run build        # Compile TypeScript to dist/
npm start            # Run the compiled production API
npm run seed:admin   # Create the initial admin and default settings document
npm run format       # Format code with Prettier
npm run format:check # Check formatting without changing files
```

## API overview

Public resources:

```text
GET  /api/settings
GET  /api/projects
GET  /api/skills
GET  /api/experience
GET  /api/education
GET  /api/certifications
POST /api/contact
```

Administrator authentication:

```text
POST /api/auth/login
GET  /api/auth/me
```

Administrator CRUD is provided for projects, skills, experience, education, certifications, messages, and settings. Protected requests must send:

```http
Authorization: Bearer <JWT>
```

## Security and deployment

- Set `CLIENT_URL` to the exact frontend URL allowed to call the API. Multiple origins may be comma-separated.
- In MongoDB Atlas, add the deployment server’s public IP to the project IP access list.
- Use a long, random `JWT_SECRET` in production.
- Build before starting in production: `npm run build && npm start`.
- The source imports use `.js` extensions intentionally: TypeScript emits corresponding JavaScript modules in `dist/` for Node.js ESM.
