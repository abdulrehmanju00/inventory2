# Restaurant Inventory & Operations

A React/Vite frontend prototype for restaurant inventory and operations management.

## Current Features

* 29 React screens
* Shared AppStore
* Location-aware inventory
* Stock receiving
* Physical stock counts
* Wastage
* Internal transfers
* Purchases
* Suppliers
* Recipes
* Production
* Reports
* Staff
* Settings
* CSV exports
* Browser localStorage persistence

## Tech Stack

* React
* Vite
* JavaScript
* Browser localStorage

## Development

Install dependencies:

npm install

Start development server:

npm run dev

Build production version:

npm run build

## Architecture

The application uses one shared frontend state store.

Inventory is tracked by:

ingredientId + location

Approved locations:

* Main Store
* Walk-in Cooler
* Dry Store
* Kitchen Prep

## Current Status

Frontend prototype only.

No Supabase, database, authentication provider, or external backend is connected yet.

## Important

Never place secret API/database keys in client-side code.

## Next Phase

After the 29-screen restaurant workspace is locked, the next stage is:

1. Login
2. Super Admin
3. Restaurant onboarding
4. Branch management
5. Restaurant users and roles
6. Multi-tenant architecture
7. Supabase integration
