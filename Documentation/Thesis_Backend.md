# PolyBookShop Backend Thesis

## Title Page
PolyBookShop Backend: Scalable Library Management API and Services

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
This thesis documents the PolyBookShop backend, a Node.js/TypeScript service that powers authentication, catalog management, loans, holds, fines, notifications, and reporting for a modern library platform. Built with Express, Prisma, and PostgreSQL, the service exposes a RESTful API secured with JWT-based authentication and role-aware authorization. The design emphasizes data integrity, transactional workflows for loans and holds, and extensible notification channels. Key contributions include a clean module structure for controllers/services/repositories, Prisma-powered data access with migrations, background flows for fines and holds, and a consistent API contract for the React frontend. The project demonstrates how opinionated TypeScript patterns and ORM-based schema management improve maintainability and delivery speed for library domains.

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
- Figure 1: High-Level Backend Architecture
- Figure 2: Request Lifecycle (API Gateway → Controller → Service → Prisma)
- Figure 3: Loan and Hold Workflow
- Figure 4: Notification Flow (events to channels)
- Figure 5: Database ER Diagram (simplified)

## List of Tables
- Table 1: Functional Requirements (Backend)
- Table 2: Non-functional Requirements (Backend)
- Table 3: API Endpoint Catalogue (summary)
- Table 4: Database Entities

## List of Abbreviations
- API: Application Programming Interface
- DB: Database
- ORM: Object-Relational Mapper
- JWT: JSON Web Token
- CRUD: Create, Read, Update, Delete
- ERD: Entity-Relationship Diagram

## 1. Introduction
### 1.1 Project Rationale
PolyBookShop requires a reliable backend to manage book inventory, member accounts, loans, holds, fines, notifications, and reports. A modular REST API accelerates frontend delivery and supports integrations while preserving data integrity.

### 1.2 Project Objectives
- Provide authenticated, role-aware REST endpoints for all library operations.
- Ensure transactional integrity for loans, holds, returns, and fines.
- Support file uploads for book PDFs and profile images.
- Expose reporting endpoints for usage statistics and notifications.
- Maintain observability and environment-driven configuration.

### 1.3 Prior Work
Legacy monolithic systems coupled UI and data, slowing change and risking data inconsistencies. Prior APIs lacked migrations, unified auth, and modern ORM support.

### 1.4 Hypothesis
A layered Express + Prisma + PostgreSQL stack with strict schema migrations and JWT security will reduce defects, improve developer velocity, and better support evolving business rules versus ad-hoc monolithic designs.

### 1.5 Proposed Solution
Implement a layered architecture: routes → controllers → services → Prisma data access. Centralize auth/authorization middleware, validation, and error handling. Use Prisma for migrations and type-safe queries. Provide dedicated modules for notifications, fines, holds, and reporting.

### 1.6 Description of the Report
The following sections describe background theory, technology selection, methodology, implementation details, testing, and concluding discussion with future work.

## 2. Background
### 2.1 Related Theory
- RESTful API design, resource modeling, and pagination.
- Transactional workflows for lending systems; consistency and isolation considerations.
- Security: authentication, authorization, CORS, and input validation.

### 2.2 Project Technology
- Node.js + TypeScript + Express for HTTP services.
- Prisma ORM with PostgreSQL for schema management and data access.
- JWT for stateless authentication and role-based authorization.
- Multer/cloud storage integration for uploads.
- Nodemailer/email service for notifications (configurable).

### 2.3 Related Work & Literature
Modern library backends leverage ORMs for safety, JWT for portability across clients, and migration pipelines for controlled schema evolution. Prior research underscores the need for clear domain boundaries and auditability in lending systems.

## 3. Methodology
- Requirements gathering: identify resources (books, members, loans, holds, fines, notifications) and roles (admin, staff, member).
- Domain modeling: define ERD and invariants (e.g., one active loan per copy, hold queues, fine accrual rules).
- API specification: design endpoint contracts, request/response schemas, and validation rules.
- Iterative development: implement in slices (auth, catalog, loans/holds, notifications, reports) with migrations per slice.
- Testing: unit tests for services and integration tests for critical routes; manual smoke tests via REST client.

## 4. Implementation
### 4.1 Architecture
- Entry: `src/server.ts` bootstraps Express app from `src/app.ts`.
- Routing: modular routers under `src/routes` (auth, book/books, loan, member, notification, report, stats).
- Controllers: translate HTTP to service calls, handle validation errors.
- Services: business logic for auth, books, loans, holds, fines, notifications, reports.
- Data: Prisma client, migrations under `prisma/migrations`, seed scripts for fixtures.

### 4.2 Key Features
- Authentication & Authorization: JWT issuance/verification, role middleware, rate limiting.
- Catalog: CRUD for books, PDF upload URLs, search and filter endpoints.
- Loans & Holds: checkout, return, renew, hold queues, availability checks, and fine accrual via services.
- Notifications: admin/member notifications, optional email delivery hooks.
- Reports & Stats: endpoints for dashboard metrics (loans, holds, fines, members).

### 4.3 Security & Compliance
- CORS configuration via environment variable.
- Input validation middleware for all major routes.
- Centralized error handler with safe messages in production.
- Principle of least privilege in queries and role checks.

### 4.4 Performance & Reliability
- Pagination on list endpoints; indexed fields in PostgreSQL via Prisma schema.
- Connection pooling via Prisma; avoidance of N+1 through relational selects.
- Graceful shutdown and process-level error logging.

## 5. Testing
- Unit tests for service logic (authentication, loan/hold state transitions, fines calculation) where implemented.
- Integration tests for critical endpoints (auth, books, loans) using test DB.
- Manual smoke tests for uploads and notification flows.
- Migration validation in non-production environments before deploy.

## 6. Discussion and Conclusion
The PolyBookShop backend shows that a layered TypeScript/Express architecture with Prisma migrations can deliver a maintainable, secure API for library operations. Clear separation of concerns and typed data access reduced regressions. Future work includes scheduled jobs for overdue reminders, webhook/eventing for analytics, and full test coverage of edge cases.

## 7. References
[Add academic and technical references relevant to REST design, ORMs, and secure Node.js services.]

## 8. Appendices
- Appendix A: API Endpoint Catalogue.
- Appendix B: Database Schema (ERD and Prisma schema excerpts).
- Appendix C: Sample Migration and Seed Scripts.
