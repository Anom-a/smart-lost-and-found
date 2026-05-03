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

The frontend expects the Laravel API JSON envelope shape and stores the Sanctum bearer token in `localStorage` after login or registration.

## Checks

```bash
cd frontend
npm run test
npm run build
```
