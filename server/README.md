# MERN Auth + Admin Scaffold

## 1) Install dependencies

```bash
cd server
npm install
```

## 2) Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
- `MONGODB_URI`
- `JWT_SECRET` (set a long random value)
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

## 3) Seed first admin

```bash
npm run seed:admin
```

## 4) Start server

```bash
npm run dev
```

Server runs at `http://localhost:5000` and serves your existing static site from project root.  
API routes:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token required)
- `POST /api/auth/logout`
- `GET /api/admin/stats` (admin only)
- `GET /api/admin/users` (admin only)
