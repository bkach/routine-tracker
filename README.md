# Routine Tracker

Interactive workout routine tracker with timers and progress tracking.

[Live Demo](https://bkach.github.io/routine-tracker/)

## Development

```bash
npm install
npm run dev
```

## Chrome DevTools MCP

This repo includes a local `.mcp.json` that registers `chrome-devtools-mcp` against a Chrome instance on `http://127.0.0.1:9222`.

Start the app:

```bash
npm run dev
```

In a second terminal, launch Chrome in remote-debug mode with an isolated profile:

```bash
npm run chrome:debug
```

To open a different URL, pass it directly to the script:

```bash
bash ./scripts/launch-chrome-debug.sh http://127.0.0.1:4173
```

Notes:
- The launcher uses `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` by default.
- Override the binary with `CHROME_BIN=/path/to/chrome`.
- The debug profile is stored in `/tmp/routine-tracker-chrome-debug` by default.
- The DevTools target list is available at `http://127.0.0.1:9222/json/list`.

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
