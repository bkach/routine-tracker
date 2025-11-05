# Routine Tracker

Interactive workout routine tracker with timers and progress tracking.

[Live Demo](https://bkach.github.io/routine-tracker/)

## Development

```bash
npm install
npm run dev
```

## Deployment

### Frontend (GitHub Pages)
Push to `main` branch. Set `VITE_WORKER_URL` in `.env` for production.

### Worker (Cloudflare)
```bash
cd worker
wrangler kv namespace create WORKOUTS
wrangler kv namespace create WORKOUTS --preview
# Update wrangler.toml with namespace IDs
npm install
npm run deploy
```

See `worker/README.md` for API details.

## License

MIT
