# Localization (Amharic)

This project includes Amharic translations for both backend (Laravel) and frontend (React).

Backend:
- Laravel language files are added under `backend/resources/lang/am` and `backend/resources/lang/am.json`.
- To enable Amharic as the app locale, set `APP_LOCALE=am` in the backend `.env`.

Frontend:
- Uses `i18next` and `react-i18next`. Translation files are in `frontend/src/locales`.
- A simple language selector is available in the app header.

Install frontend dependencies and run:
```bash
cd frontend
npm install
npm run dev
```
