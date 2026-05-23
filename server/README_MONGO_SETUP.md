# MongoDB Atlas setup (VA0rbit)

The backend connects to **MongoDB Atlas** using `MONGO_URI` in `server/.env`.

## Quick setup

1. Copy `server/.env.example` → `server/.env`
2. Set your Atlas password in the connection string:

```env
MONGO_URI=mongodb+srv://dbvaorb:<db_password>@va0rbit.4axc3iu.mongodb.net/vaorb?retryWrites=true&w=majority&appName=VA0rbit
```

3. In Atlas → **Network Access**, allow your IP (or `0.0.0.0/0` for development).
4. Start the API:

```bash
npm run server
```

Or sync collections manually:

```bash
npm run sync-db --prefix server
```

## Expected logs

- Success: `MongoDB connected successfully! (vaorb)`
- Failure: falls back to `server/data/db.json` (local JSON mode)

## Collections

| Collection   | Purpose                          |
|-------------|-----------------------------------|
| `pricings`  | Rate cards (seeded on first run)  |
| `inquiries` | Contact form submissions          |
| `bookings`  | Consultation bookings             |
| `analytics` | Page views & click tracking       |
