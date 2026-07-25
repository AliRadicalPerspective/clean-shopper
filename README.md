# Clean Shopper

An AI-powered agent that helps users discover home and pantry products that are clean, non-toxic, and environmentally friendly. Users research products, compare options on ingredient safety and sustainability, save preferences, and build a shopping cart — all through a conversational interface backed by Claude.

Course demo project for **Claude Code for Designers**.

## Feature scope (V1)

- **Product research** — describe what you're looking for; Clean Shopper evaluates ingredients against clean standards and surfaces recommendations with reasoning (real-time web search + ingredient-safety databases like EWG's Skin Deep).
- **Preference management** — save ingredients to avoid, trusted brands, and certifications that matter (EWG Verified, USDA Organic, B Corp); applied automatically to every recommendation.
- **Shopping cart** — recommended products persist across sessions.
- **Comparison** — side-by-side product comparison with a clear recommendation based on saved preferences.

Out of scope for V1: checkout/payment, direct retailer integrations, barcode scanning, user accounts/auth, mobile app.

See [`docs/CCDCourse_CleanShopper_ProjectBrief.md`](docs/CCDCourse_CleanShopper_ProjectBrief.md) for the full brief.

## Stack

React + Vite.

## Getting started

```bash
npm install
npm run dev
```
