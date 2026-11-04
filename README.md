# Higher / Lower & Code Duel

A mobile-first, bilingual (Arabic RTL / English LTR) number duel built with React, Tailwind CSS, Lucide, and Supabase Realtime. Rooms use one Realtime channel with Presence and Broadcast only. The app does not create database tables or require player accounts.

## Play locally

```sh
npm install
npm run dev
```

Solo mode works offline. To use online rooms, open **Connection settings** in the game and enter a Supabase project URL and its public `anon` key. The same values can be supplied as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` before building.

In Supabase, Realtime must be enabled and **Allow public access** for channels must remain enabled. The room topic is `room-ABCDE`; presence holds player names/IDs, and broadcast carries public game state and guesses. Secrets stay in each player's browser storage and are never broadcast. The public anon key is intended for browser use; never use a `service_role` key here.

## Publish on GitHub Pages

The included GitHub Actions workflow builds and deploys the site on pushes to `main` or `master`.

1. In the repository, add Actions secrets named `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (optional for a solo-only build).
2. In **Settings → Pages**, set the publishing source to **GitHub Actions**.
3. Push to `main` (or `master`) and check the **Actions** tab. The deployed URL is shown on the Pages deployment.

If the credentials are not added as repository secrets, online users can still paste them into the in-game settings on their device. That setting is saved in that browser only.

## Included modes and features

- Classic Higher / Lower: Easy (1–50, 8 attempts), Normal (1–100, 7), and Hard (1–1000, 10).
- Code Duel: four digits including leading zeroes, repeated digits allowed, ten attempts, and exact-position-only feedback.
- Solo bot: binary search with difficulty-scaled noise for number mode; positional candidate narrowing for code mode.
- Two player seats per room; additional visitors are spectators.
- Best-of-three match scoring, a running series-win count, 20-second turns, missed-turn handling, reconnection notices, emoji reactions, and quick rematches.
- Browser-generated sound effects, dark/light themes, language switch, shareable room links/results, and installable PWA shell.

## Notes

Realtime rooms are trust-based and ephemeral: there is no server-side match validation or durable room storage. Reconnecting players can recover public state from their current browser session, but clearing that browser session loses it. The secret remains local to its owner.
