# Routine Share Worker

Cloudflare Worker for slug-based workout sharing.

## Overview

This Worker provides two endpoints:
- `POST /new` - Save a workout YAML and get a short slug
- `GET /s/:slug` - Retrieve a workout YAML by slug

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create KV namespace:
   ```bash
   wrangler kv:namespace create "WORKOUTS"
   wrangler kv:namespace create "WORKOUTS" --preview
   ```

3. Update `wrangler.toml` with the namespace IDs from step 2

4. Deploy:
   ```bash
   npm run deploy
   ```

## Local Development

```bash
npm run dev
```

This starts the Worker on http://localhost:8787

## API

### POST /new
Save a workout and get a slug.

**Request:**
```bash
curl -X POST http://localhost:8787/new \
  -H "Content-Type: text/plain" \
  -d "title: My Workout
exercises:
  - name: Push-ups
    type: reps
    sets: 3
    reps: 10"
```

**Response:**
```json
{
  "slug": "abc12"
}
```

### GET /s/:slug
Retrieve a workout by slug.

**Request:**
```bash
curl http://localhost:8787/s/abc12
```

**Response:**
```yaml
title: My Workout
exercises:
  - name: Push-ups
    type: reps
    sets: 3
    reps: 10
```

## Security

- **Size limit**: 20KB max per workout
- **CORS**: Enabled for all origins (adjust in production if needed)
- **Rate limiting**: Consider adding rate limiting for production
- **No authentication**: Public read/write (suitable for workout sharing)

## Cloudflare KV

Workouts are stored in Cloudflare KV, which provides:
- Global edge caching
- Unlimited reads (free tier)
- 1000 writes/day (free tier)
- 1 GB storage (free tier)

For higher limits, upgrade to Cloudflare's paid plans.
