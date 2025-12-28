# PolyBookShop Frontend Thesis

## Title Page
PolyBookShop Frontend: A Modern Web Interface for Library Operations

by

[Your Name]

A Thesis Submitted in Partial Fulfillment of the Requirements for the Degree of

Bachelor of Science in Information & Communication Technology

at

Bahrain Polytechnic

December 2025

## Copyright
© 2025 [Your Name]. All rights reserved.

## Declaration
I hereby declare that this submission is my own work and that, to the best of my knowledge and belief, it contains no material previously published or written by another person nor material which to a substantial extent has been accepted for the award of any other degree or diploma of the university or other institute of higher learning, except where due acknowledgment has been made in the text.

Signature: __________   Name: __________   Date: __________

## Approval Signatures
- Thesis Supervisor: __________________  Date: __________
- Technical Writing Tutor: ______________  Date: __________

## Abstract
This thesis presents the design and implementation of the PolyBookShop frontend, a responsive single-page application (SPA) that enables patrons and staff to manage books, loans, holds, notifications, and reports through a streamlined web interface. Built with Vite, React, TypeScript, and Tailwind CSS, the frontend consumes a RESTful API provided by the PolyBookShop backend. The application emphasizes usability, accessibility, and performance through component-driven development, predictable client-side state, and cache-aware data fetching. Key contributions include a modular UI library, secure authentication flows, role-aware navigation, and rich data visualizations for loan, hold, and fine statistics. The project demonstrates how modern frontend tooling can accelerate delivery while maintaining code quality and maintainability.

## Acknowledgements
I would like to thank my supervisor, colleagues, and family for their guidance and support throughout this project.

## Table of Contents
1. Introduction
2. Background
3. Methodology
4. Implementation
5. Testing
6. Discussion and Conclusion
7. References
8. Appendices

## List of Figures
- Figure 1: Frontend Architecture Diagram
- Figure 2: Navigation Flow (Public vs. Authenticated)
- Figure 3: Dashboard Overview
- Figure 4: Books Listing and Filters
- Figure 5: Loan and Hold Management Screens
- Figure 6: Notification Center UI

## List of Tables
- Table 1: Functional Requirements (Frontend)
- Table 2: Non-functional Requirements (Frontend)
- Table 3: Accessibility Checklist

## List of Abbreviations
- SPA: Single-Page Application
- API: Application Programming Interface
- UI: User Interface
- UX: User Experience
- JWT: JSON Web Token
- CSR: Client-Side Rendering
- SSR: Server-Side Rendering

## 1. Introduction
### 1.1 Project Rationale
Library staff and patrons need a responsive, intuitive interface to search, borrow, hold, and manage books without friction. A modern SPA reduces page loads, improves perceived performance, and enables richer interactivity compared to legacy multi-page designs.

### 1.2 Project Objectives
- Deliver a responsive SPA for patrons and staff.
- Provide secure authentication and role-based navigation.
- Offer intuitive flows for search, borrowing, returns, holds, fines, and notifications.
- Visualize key metrics (loans, holds, fines) for staff decision-making.
- Ensure accessibility, performance, and maintainability.

### 1.3 Prior Work
Prior systems relied on page-by-page server rendering with limited interactivity and slower perceived performance. Existing library portals often lacked modern filtering, offline-tolerant navigation, and responsive layouts.

### 1.4 Hypothesis
A React/Vite/Tailwind SPA with predictable state and cached API integration will improve task completion time, user satisfaction, and perceived responsiveness versus legacy multi-page approaches.

### 1.5 Proposed Solution
Implement a component-driven SPA with protected routes, shared layout primitives, reusable form controls, optimistic UI for common actions, and charting for staff metrics. Integrate with the backend REST API using typed clients and centralized error handling.

### 1.6 Description of the Report
The remaining sections cover background theory and technology choices, methodology, implementation details, testing, and a concluding discussion with future work.

## 2. Background
### 2.1 Related Theory
- SPA/CSR patterns: routing on the client, state hydration, and API-driven UI.
- Usability and accessibility: WCAG alignment, keyboard navigation, semantic HTML.
- Performance: code-splitting, asset optimization, caching strategies.

### 2.2 Project Technology
- Vite + React + TypeScript for fast dev/build and type safety.
- Tailwind CSS for utility-first styling and rapid iteration.
- React Router for client-side routing.
- (Optional) React Query or similar for server-state caching; Zustand/Context for local UI state.
- Charting (e.g., Recharts/Chart.js) for dashboard visualizations.

### 2.3 Related Work & Literature
Modern library portals and admin dashboards show gains from SPA patterns, client-side caching, and responsive design. Prior art highlights the need for robust error handling and accessibility to serve diverse user bases.

## 3. Methodology
- Requirements elicitation: map user stories for patrons (search, borrow, holds) and staff (catalog management, fines, reports).
- Information architecture: define navigation, route guards, and layout shells.
- UI/UX design: wireframes and component library (buttons, inputs, tables, modals, toasts).
- Implementation: iterative sprints with feature flags; API contract alignment with backend.
- Testing: component/unit tests (Vitest/React Testing Library) and manual exploratory testing in major browsers.

## 4. Implementation
### 4.1 Architecture
- Entry: `src/main.tsx` mounts `App` with router and global providers.
- Routing: public routes (login/register), protected routes (dashboard, books, loans, holds, notifications, reports).
- State: server data cached per endpoint; UI state (dialogs, filters) scoped per page.
- UI Library: shared components for forms, tables, pagination, breadcrumbs, toasts.
- Styling: Tailwind utility classes with a small design token layer for colors, spacing, and typography.

### 4.2 Key Features
- Authentication: login/register, token storage, route guards, and role-aware menus.
- Books: search, filter, view details, request loan/hold, upload/view PDFs (if permitted).
- Loans & Holds: view status, renew/return flows with optimistic updates.
- Notifications: inbox view, mark-as-read, and preference toggles (if enabled by backend).
- Reports & Stats: charts for loans/holds/fines and member activity (staff role).

### 4.3 Security & Privacy
- JWT handling in memory/local storage with refresh strategy (aligned with backend).
- CSRF-safe API usage via Bearer tokens over HTTPS.
- Input validation and user feedback on all forms.

### 4.4 Performance & Accessibility
- Route-based code-splitting for heavy pages.
- Lazy-loaded charts and PDF viewers.
- Keyboard navigability, focus management, and semantic landmarks.
- Image/PDF lazy loading where applicable.

## 5. Testing
- Unit/component tests for core UI components and flows (forms, tables, navigation guards).
- Integration tests for auth and critical CRUD paths where feasible.
- Cross-browser smoke tests (Chrome/Edge/Firefox) and responsive viewport checks.
- Accessibility checks with axe and manual keyboard traversal.

## 6. Discussion and Conclusion
The PolyBookShop frontend demonstrates that a modern SPA stack can deliver responsive, accessible workflows for library operations. Component reuse and typed API clients reduced defects and improved development speed. Future improvements include offline-first caching, expanded i18n, and fuller automation of end-to-end tests.

## 7. References
[Add academic and technical references relevant to frontend SPA architecture, accessibility, and performance.]

## 8. Appendices
- Appendix A: Wireframes and UI prototypes.
- Appendix B: Component library inventory.
- Appendix C: Test cases and results.
