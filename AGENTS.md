Documents

- `_docs/process.md` - how work is organized
- For the json required for the frontend, read `_docs/api.md`

Commands

Run from `web/`.

- `npm install` - install dependencies
- `npm run dev` - start the Vite dev server
- `npm test` - the whole suite (Vitest, single run)
- `npx vitest run src/App.test.tsx` - one test file
- `npm run build` - type check and production build
- `npm run lint` - lint with oxlint

Rules

- Dependencies are added in `web/package.json`. Do not add one without
  asking
