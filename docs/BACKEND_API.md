# Backend API And Database Notes

## Runtime

The verified backend runtime is the Docker `backend` service, which uses PHP 8.1.2 with the required PDO/PostgreSQL and DOM extensions.

Use:

```bash
docker compose run --rm backend php artisan migrate:fresh --seed
docker compose run --rm backend php artisan test
```

Host `php artisan` commands require the host PHP installation to have the appropriate PDO driver enabled.

## Authentication

Authentication uses Laravel Sanctum personal access tokens.

### Register

`POST /api/auth/register`

Required fields:

- `name`
- `email`
- `student_id`
- `password`
- `password_confirmation`

Optional fields:

- `phone`
- `profile_photo_path`

Successful responses return:

- `success`
- `message`
- `data.user`
- `data.token`
- `data.token_type`

### Login

`POST /api/auth/login`

Required fields:

- `email`
- `password`

### Authenticated Profile

`GET /api/auth/me`

Requires:

```http
Authorization: Bearer <token>
```

### Logout

`POST /api/auth/logout`

Requires:

```http
Authorization: Bearer <token>
```

The current Sanctum access token is deleted.

## Database Schema

Main domain tables:

- `item_categories`
- `lost_items`
- `found_items`
- `claim_requests`
- `notifications`

Important relationships:

- `lost_items.user_id` references `users.id`
- `found_items.user_id` references `users.id`
- `lost_items.item_category_id` references `item_categories.id`
- `found_items.item_category_id` references `item_categories.id`
- `claim_requests.lost_item_id` references `lost_items.id`
- `claim_requests.found_item_id` references `found_items.id`
- `claim_requests.claimant_id` references `users.id`
- `notifications.user_id` references `users.id`

Status values:

- `lost_items.status`: `open`, `claimed`, `closed`
- `found_items.status`: `available`, `claimed`, `closed`
- `claim_requests.status`: `pending`, `approved`, `rejected`

Search fields:

- `lost_items.title`
- `lost_items.description`
- `found_items.title`
- `found_items.description`

Laravel's `$table->fullText()` is used for the search indexes. In PostgreSQL, these are generated as GIN `to_tsvector` indexes. In MySQL, they are generated as `FULLTEXT` indexes.

Seeded item categories:

- Electronics
- Clothing
- Documents/Books
- Keys
- Bags
- Accessories
- Sports Equipment
- Other
