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

## Contact notifications

Every new contact message can notify you by email and browser push notification. Add these values to the API `.env` file:

```env
NOTIFICATION_EMAIL=the_inbox_that_receives_contact_alerts
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM="Portfolio <hello@your-verified-domain.com>"
VAPID_SUBJECT=mailto:you@example.com
VAPID_PUBLIC_KEY=your_generated_public_key
VAPID_PRIVATE_KEY=your_generated_private_key
```

Create a Resend API key and verify the domain used in `RESEND_FROM`. Generate the VAPID key pair once with `npx web-push generate-vapid-keys --json`, then keep the private key secret. After deployment, sign in to the admin panel and select **Enable browser alerts** on the Settings page for each device that should receive pushes. Browser push requires HTTPS in production (localhost is allowed during development).

## Resume uploads

The admin Settings page uploads PDF resumes to Cloudflare R2, using the same private-storage pattern as BPLO. Add the following values to the API `.env` file before uploading:

```env
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET=your_r2_bucket_name
```

The access key needs read, write, and delete access to that bucket. Uploaded resumes are limited to 10 MB and replacing one removes the old managed file.

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
