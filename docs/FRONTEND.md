# Frontend

The React frontend provides the student-facing Smart Lost and Found workflows:

- Authentication pages for login and registration.
- Protected application routes under the main dashboard layout.
- Lost item browsing, filtering, detail, and report creation.
- Found item browsing, filtering, detail, and report creation.
- Match, claim, and notification pages backed by the Laravel API.
- Reusable components for item cards, report forms, match cards, notification access, navigation, empty states, and layout.

## Routes

- `/login`
- `/register`
- `/dashboard`
- `/lost-items`
- `/lost-items/new`
- `/lost-items/:id`
- `/found-items`
- `/found-items/new`
- `/found-items/:id`
- `/matches`
- `/claims`
- `/notifications`

## API Configuration

Set the API base URL in `frontend/.env`:

```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

`VITE_API_URL` is also supported and takes precedence when both variables are present.

The frontend expects the Laravel API JSON envelope shape and stores the Sanctum bearer token in `localStorage` after login or registration. All mock data has been removed from the runtime frontend; pages now call the Laravel API through `src/lib/apiData.ts`.

## Connected API Flows

- Auth: `POST /api/auth/login`, `POST /api/auth/register`, and `POST /api/auth/logout`.
- Items: `GET /api/lost-items`, `GET /api/lost-items/:id`, `POST /api/lost-items`, `GET /api/found-items`, `GET /api/found-items/:id`, and `POST /api/found-items`.
- Categories: `GET /api/categories` powers the report form category selector.
- Matches: the matches view loads lost reports and calls `GET /api/lost-items/:id/matches` for scored found-item candidates.
- Claims and notifications: `GET /api/claims` and `GET /api/notifications` use the stored bearer token.

## Checks

```bash
cd frontend
npm test -- --run
npm run build
```

Backend API verification:

```bash
docker compose run --rm backend php artisan test
```
