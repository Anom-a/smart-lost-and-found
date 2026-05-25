# Backend Architecture & Design Report

## Executive Summary

This document describes the backend for the Smart Lost and Found project, from high-level architecture down to low-level folder responsibilities. The backend is a Laravel application that provides REST APIs, business logic (matching, claims processing), persistent storage (MySQL / SQL-compatible DB), notifications, and background processing. The goal of this report is to map each design phase to the corresponding folders and files in the repository so engineers can quickly find where to implement changes.

---

## Phase 1 — High-Level Architecture

- Purpose: Accept reports of lost and found items, compute matches, allow claims, and notify stakeholders.
- Framework: Laravel (PHP) — MVC, service classes, notifications, policies, queues.
- Key runtime responsibilities:
  - HTTP API and web routes: authentication, validation, controllers.
  - Business logic: matching engine, claims workflow, notifications.
  - Data persistence: models, migrations, factories, seeders.
  - Background processing: queue workers for matching, notifications, and exports.

Primary folders (top-level):

- `backend/app` — application code (models, controllers, services, notifications, policies)
- `backend/routes` — `api.php`, `web.php` for endpoints
- `backend/config` — runtime configuration (mail, queue, auth, matching)
- `backend/database` — migrations, seeders, factories
- `backend/tests` — unit and feature tests
- `backend/bootstrap` + `backend/public` + `backend/storage` — runtime bootstrap, web entry, and writable storage

---

## Phase 2 — System Components and Folder Responsibilities

- `backend/app/Models`
  - Domain models: `LostItem.php`, `FoundItem.php`, `ClaimRequest.php`, `ItemCategory.php`, `Notification.php`, `User.php`
  - Responsibilities: ORM definitions, relationships, attribute casts, scopes.

- `backend/app/Http/Controllers`
  - Controllers map HTTP requests to services and return JSON responses.
  - Typical controllers: `LostItemController`, `FoundItemController`, `MatchController`, `ClaimController`, `AuthController`.

- `backend/app/Services`
  - Business logic and orchestration live here (e.g., `MatchingService.php`).
  - Use services for testable, framework-agnostic logic: scoring, ranking, heuristics.

- `backend/app/Notifications`
  - Laravel notifications for email, database, and push notifications (ClaimApprovedNotification, etc.).

- `backend/app/Policies`
  - Authorization rules for resources (e.g., `FoundItemPolicy.php`, `LostItemPolicy.php`).

- `backend/app/Console` and `backend/app/Providers`
  - Artisan commands, scheduled tasks, and service provider bootstrapping (binding interfaces, registering observers).

- `backend/routes`
  - `api.php`: primary machine API surface used by frontend and mobile clients.
  - `web.php`: any web pages or health checks.

- `backend/config`
  - `matching.php` exists and contains configuration parameters for matching thresholds and scoring weights.

- `backend/database`
  - `migrations/`: schema changes for each model.
  - `factories/` and `seeders/`: test and dev data.

- `backend/tests`
  - `Feature/` and `Unit/` tests asserting API contracts, services, and policy logic.

---

## Phase 3 — Data Model (High → Low)

Key domain entities and relationships (conceptual):

- User
  - owns ClaimRequests, can file lost/found reports, receives Notifications

- LostItem
  - belongsTo User (reporter)
  - belongsTo ItemCategory
  - hasMany ClaimRequests
  - fields: id, title, description, location, date, status, metadata

- FoundItem
  - similar shape to LostItem
  - fields: id, title, description, location, date, status (available/claimed), photos

- ClaimRequest
  - belongsTo User, polymorphic relation to item (lost/found)
  - fields: claimant, reason, status (pending/approved/rejected), submittedAt

- Matches (derived)
  - Not necessarily an Eloquent model; produced by `MatchingService` by comparing lost/found features. Persisted matches may be stored or cached depending on design.

Implementation notes:
- Migrations live in `backend/database/migrations/` and define indexes used by matching (e.g., location index, date index).
- Factories and seeders help generate reproducible matches for testing. See `backend/database/factories` and `backend/database/seeders`.

---

## Phase 4 — API Design and Route Mapping

Map high-level API resources to router files and controllers:

- Dashboard: `GET /api/dashboard` → `DashboardController@index` → aggregates: open counts, recent items, matches, claims
- Lost Items: `GET /api/lost-items`, `POST /api/lost-items`, `GET /api/lost-items/{id}` → `LostItemController`
- Found Items: `GET /api/found-items`, `POST /api/found-items`, `GET /api/found-items/{id}` → `FoundItemController`
- Matches: `GET /api/matches`, `GET /api/matches/{id}` → `MatchController` (or `MatchingService` via controller)
- Claims: `POST /api/claims`, `GET /api/claims`, `PATCH /api/claims/{id}` → `ClaimController`
- Notifications: `GET /api/notifications`, mark-as-read endpoints → `NotificationController`

Look in `backend/routes/api.php` for actual route definitions.

---

## Phase 5 — Services, Matching & Background Work

- `backend/app/Services/MatchingService.php` implements the core scoring and matching pipeline. Keep the service:
  - pure and testable — accept item DTOs, return scored candidate lists
  - orchestrate use of helpers (text similarity, geospatial distance, date proximity)

- Queues: offload heavy matching jobs and notifications to the queue worker. Configure in `backend/config/queue.php` and use workers in deployment.

- Notifications: dispatch `MatchFoundNotification`, `NewClaimNotification`, etc., from services when state changes.

---

## Phase 6 — Security, Policies, and Auth

- Use `app/Policies/*` to encapsulate resource authorization.
- Authentication: configured via `backend/config/auth.php` and `sanctum` (see `config/sanctum.php`) for token-based API access.
- Validate all inputs in `app/Http/Requests/` classes.

---

## Phase 7 — Persistence, Indexes & Optimization

- Put indices on columns frequently used by matching (e.g., `location`, `date`, `status`).
- If geospatial queries are required, consider using PostGIS or a lat/lon numeric pair with bounding-radius math.

---

## Phase 8 — Testing & Quality

- Unit tests: services and helpers in `backend/tests/Unit`
- Feature tests: API endpoints and policies in `backend/tests/Feature`
- PHPUnit config: `backend/phpunit.xml`

---

## Phase 9 — Deployment & Operations

- Dockerfile and `docker-compose.yml` are present at repo root for containerized deployment.
- Use `storage/` for file uploads (public/storage symlinked to `backend/public/storage`). Ensure `backend/storage` is writable.
- Use `Procfile` for Heroku-like deploys; configure queue workers and scheduler in production.

---

## Phase 10 — Low-level Implementation Checklist (where to change code)

1. Add or update model fields: `backend/app/Models/*.php` and `backend/database/migrations/*.php`
2. Implement controller endpoints: `backend/app/Http/Controllers/*Controller.php` and wire routes in `backend/routes/api.php`
3. Implement business rules: `backend/app/Services/*` and unit-test in `backend/tests/Unit`
4. Create notifications: `backend/app/Notifications/*` and trigger them from services
5. Add policies: `backend/app/Policies/*` and register in `backend/app/Providers/AuthServiceProvider.php`
6. Add migrations/seeders/factories: `backend/database/*` for reproducible dev/test data
7. Add integration/feature tests: `backend/tests/Feature/*`
8. Configure queues, mail, and environment secrets: `backend/config/*` and `.env` at deploy

---

## Next steps & recommendations

- Audit `backend/app/Services/MatchingService.php` to extract pure matching logic into a small library for easy unit testing.
- Add API contract documentation (OpenAPI/Swagger) and a `backend/docs/` folder.
- Add more feature tests around claims lifecycle and matching to prevent regressions.

---

Document author: automated report generator
