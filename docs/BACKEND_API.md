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

## Core REST API

All protected endpoints require:

```http
Authorization: Bearer <token>
```

### Categories

`GET /api/categories`

Returns all item categories.

### Lost Items

Public:

- `GET /api/lost-items`
- `GET /api/lost-items/{lostItem}`

Protected:

- `POST /api/lost-items`
- `PUT/PATCH /api/lost-items/{lostItem}`
- `DELETE /api/lost-items/{lostItem}`

Supported list filters:

- `search`
- `category_id`
- `date_from`
- `date_to`
- `status`
- `page`
- `per_page`

Create/update fields:

- `item_category_id`
- `title`
- `description`
- `keywords[]`
- `lost_location`
- `lost_at`
- `contact_preference`
- `status`
- `images[]`

Images are uploaded to the `public` disk under `lost-items/`, which maps to `storage/app/public/lost-items`.

Only the owner can update or delete a lost item.

### Found Items

Public:

- `GET /api/found-items`
- `GET /api/found-items/{foundItem}`

Protected:

- `POST /api/found-items`
- `PUT/PATCH /api/found-items/{foundItem}`
- `DELETE /api/found-items/{foundItem}`

Supported list filters:

- `search`
- `category_id`
- `date_from`
- `date_to`
- `status`
- `page`
- `per_page`

Create/update fields:

- `item_category_id`
- `title`
- `description`
- `keywords[]`
- `found_location`
- `found_at`
- `handover_location`
- `status`
- `images[]`

Images are uploaded to the `public` disk under `found-items/`, which maps to `storage/app/public/found-items`.

Only the owner can update or delete a found item.

### Claims

Protected:

- `GET /api/claims`
- `POST /api/claims`
- `GET /api/claims/{claim}`
- `POST /api/claims/{claim}/approve`
- `POST /api/claims/{claim}/reject`

Create fields:

- `lost_item_id`
- `found_item_id`
- `message`
- `proof_details`

Duplicate claims by the same student for the same lost/found pair return `409`.

Approving a claim sets:

- `claim_requests.status` to `approved`
- `lost_items.status` to `claimed`
- `found_items.status` to `claimed`

Rejecting a claim sets `claim_requests.status` to `rejected`.

### Matches

`GET /api/matches`

Query with either:

- `lost_item_id`
- `found_item_id`

The endpoint returns same-category candidate matches.

`GET /api/lost-items/{lostItem}/matches`

Returns scored found-item matches for a reported lost item.

The matching engine uses these weighted signals:

- Category match: `0.40`
- Keyword overlap: `0.35`
- Date proximity: `0.15`
- Location match: `0.10`

The default threshold is `0.40`. Results below the threshold are excluded.

Scoring details:

- Category score is `1.0` when categories match, otherwise `0.0`.
- Keyword score uses Jaccard similarity over the `keywords` arrays.
- Date score uses exponential decay: `e^(-days_diff / 7)`.
- Location score uses partial normalized string comparison.

Only found items with `status = available` are returned. Claimed or closed found items are excluded.

Lost and found items automatically extract keywords from title and description when no keywords are provided.

### Notifications

Protected:

- `GET /api/notifications`
- `POST /api/notifications/{notification}/mark-read`
- `POST /api/notifications/mark-all-read`

Users may only read or update their own notifications.
