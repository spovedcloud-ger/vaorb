# MongoDB Atlas setup (VA0rbit)

This backend uses **`MONGO_URI`** from `server/.env`.

## 1) Get your MongoDB Atlas connection string
From Atlas → your cluster (VA0rbit) → **Connect** → **Drivers** → **Node.js** (or copy the full connection string).

You should get something like:

`mongodb+srv://<username>:<password>@va0rbit.4axc3iu.mongodb.net/?appName=VA0rbit`

## 2) Put it into `server/.env`
Edit `server/.env` and set:

- `MONGO_URI=<PASTE_CONNECTION_STRING_HERE>`
- `PORT=5000`

## 3) Restart the server
Stop and run the server again so it picks up the env var.

Expected behavior:
- If the connection works, the server will log `MongoDB connected successfully!`
- If it fails, it will fall back to `server/data/db.json`.

