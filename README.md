# Smart Lost and Found

A comprehensive platform designed to facilitate the recovery of lost items and the reporting of found ones. This project uses a modern monorepo architecture to provide a seamless and intelligent user experience.

## System Overview

The **Smart Lost and Found** system is built to bridge the gap between people who have lost belongings and those who have found them. Key features include:

- **Intelligent Item Reporting**: Users can detailedly report lost items (specifying category, location, and time) or report items they've found.
- **Automated Matching**: The system analyzes reported items to suggest potential matches, speeding up the recovery process.
- **Claim Management**: A structured workflow for users to submit claim requests for found items, allowing for verification of ownership.
- **Real-time Notifications**: Users are alerted to new matches, claim status updates, and system announcements.
- **User Dashboard**: A personal hub for users to track their active reports, claims, and recent activity.

## Project Structure

This repository is organized as a monorepo, separating the concerns of the backend API and the frontend user interface:

- **`backend/`**: A robust **Laravel 11** API.
  - Handles authentication (Sanctum), database management, and business logic.
  - **Key Models**: `User`, `LostItem`, `FoundItem`, `ClaimRequest`, `ItemCategory`, and `Notification`.
  - **API Endpoints**: Includes specialized routes for matching, claim approval/rejection, and notification management.
- **`frontend/`**: A high-performance **React** Single Page Application (SPA).
  - Built with **TypeScript** and **Vite** for a fast development experience.
  - **State Management**: Uses React Context and Hooks for efficient data handling.
  - **Routing**: Client-side routing for seamless navigation between Dashboard, Items, and Auth pages.
- **`docs/`**: Detailed documentation for developers and stakeholders:
  - `BACKEND_API.md`: Documentation for the RESTful endpoints.
  - `FRONTEND.md`: Guide for frontend development and component structure.
  - `USECASES.md`: Detailed business logic and user flow definitions.
  - `CHANGES.MD`: Changelog tracking project evolution.
- **`docker-compose.yml`**: Simplifies local development by providing a pre-configured environment (Database, PHP, Node).
- **`.gitignore`**: Standard configuration to exclude sensitive files (`.env`) and large directories (`vendor/`, `node_modules/`).
