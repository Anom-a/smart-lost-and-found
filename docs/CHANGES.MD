# Changes

## Backend database and authentication

- Added the Smart Lost and Found database schema for item categories, lost items, found items, claim requests, and notifications.
- Added foreign key constraints between users, categories, lost items, found items, claim requests, and notifications.
- Added soft deletes to `lost_items` and `found_items`.
- Added keyword JSON columns and full-text title/description indexes for lost and found items.
- Added `ItemCategorySeeder` with the default item categories.
- Added Sanctum token authentication endpoints for registration, login, logout, and authenticated profile lookup.
- Added student profile fields to users: `student_id`, `phone`, and `profile_photo_path`.
- Added feature tests for category seeding and authentication flows.

Verified with:

```bash
docker compose run --rm backend php artisan migrate:fresh --seed -vvv
docker compose run --rm backend php artisan test
docker compose run --rm backend php artisan route:list --path=api/auth
```
