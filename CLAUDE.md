# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies (client + server)
npm run install:all

# Start development (client @ 5173, server @ 8000, runs concurrently)
npm run dev

# Build client only
npm run build:client

# Start production server (serves built client @ 8000)
npm start

# Client-only dev
npm run dev:client

# Server-only dev
npm run dev:server
```

No test or lint scripts are configured.

## Architecture

Word Arena is a real-time word-command battle game. Players type commands to attack/defend/heal in turn-based combat. Frontend communicates with the backend exclusively via Socket.io WebSocket events.

### Project Layout

- `client/` — React 18 + TypeScript + Vite SPA
- `server/` — Express + Socket.io + SQLite backend
- `server/data/data.json` — All game command definitions (damage, defense, coolTime)
- `server/data/users.db` — SQLite user database

### Client Pages (React Router v6)

| Route | Page | Purpose |
|---|---|---|
| `/` | TopPage | Login / Signup |
| `/rooms` | RoomsPage | Room selection (AI battle entry) |
| `/standby` | StandbyPage | Waiting screen placeholder |
| `/battle` | BattlePage | Core game logic (~520 lines) |

### Game Mechanics (BattlePage.tsx)

All battle logic lives in `client/src/BattlePage.tsx`. Key patterns:

- **HP**: tracked with `useRef` for mutation during intervals; `const.ts` defines `HP_MAX=500`, `HP_INIT=450`
- **Cooldowns**: Regular skills share one cooldown ref; `regenerate` uses an independent cooldown ref
- **Fields**: 4 field types (`flame`, `ocean`, `earth`, `holy`). Activating a field enables its sub-commands. Fields can be permanently disabled by "burn out" (flame) or "earth quake" (earth).
- **Defense buffs**: Stack additively via refs
- **Command data**: Fetched from server via `commandData` socket event on mount; defined in `data.json`

### Socket.io Events

| Event | Direction | Purpose |
|---|---|---|
| `login` | client→server | Authenticate user |
| `signup` | client→server | Register user |
| `commandData` | client→server (request) | Fetch command definitions |
| `loginResult` / `signupResult` | server→client | Auth responses |
| `commandData` | server→client (response) | Broadcast command JSON |

### Key Files

- `client/src/const.ts` — Game constants (`HP_MAX`, `HP_INIT`, `GAME_DURATION`, `IS_DEBUG`)
- `client/src/types/index.ts` — `CommandEntry` interface (recursive for nested sub-commands)
- `server/src/server.ts` — Express + Socket.io setup, SPA fallback routing
- `server/src/db/sqlite.ts` — User auth (plain text passwords)

### Development Notes

- `IS_DEBUG = true` in `const.ts` skips the start screen during development
- Vite dev server proxies `/socket.io` to `localhost:8000`
- Production: `npm run build:client` then `npm start` serves static files from Express at port 8000
- Docker: multi-stage build, exposes port 8080
