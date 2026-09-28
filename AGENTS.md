# GymFlow AI Development Rules

GymFlow is a workout tracking application built with a clean backend-first architecture.

The goal is to build a real-world system with scalable architecture and clear domain boundaries.

---

# Tech Stack

Frontend

- Next.js (App Router)
- React Server Components
- GraphQL Client

Backend

- NestJS
- Apollo GraphQL
- Prisma ORM
- JWT Authentication

Database

- PostgreSQL (Supabase)

---

# Architecture Reference

The project architecture is documented in:

docs/architecture.md

Before implementing new features, agents must read and follow the architectural principles described in this file.

Key architectural rules:

- Business logic must live in the API layer (NestJS services).
- GraphQL resolvers must remain thin and should not contain domain logic.
- Data access must happen through Prisma.
- The frontend should only act as an API consumer.
- Domain logic should remain independent from infrastructure when possible.

If a new feature requires architectural changes, the agent should propose updating the architecture documentation.

# Architecture Consistency

Agents must respect the existing architecture and folder structure.

Do not introduce new architectural patterns or layers without justification.

If a change affects architecture boundaries, update:

docs/architecture.md

# Architecture Rules

Backend owns ALL business logic.

Frontend is only a consumer of the API.

Do NOT place business rules inside React components.

GraphQL is the only communication layer between frontend and backend.

Database access must happen only through Prisma.

---

# NestJS Backend Structure

Follow a layered architecture:

Resolver (GraphQL)
↓
Service (Application layer)
↓
Domain Logic
↓
Prisma ORM
↓
PostgreSQL

Rules:

- Resolvers should stay thin.
- Services orchestrate application logic.
- Domain logic should remain isolated from infrastructure.

---

# Code Quality

- Use strict TypeScript
- Prefer small modules
- Avoid large files
- Prefer explicit typing

---

# Database Rules

- All schema changes must go through Prisma migrations
- Never modify database tables manually in Supabase
- Always update Prisma schema first

---

# Git Commit Rules

Commits MUST follow Conventional Commits format.

Pattern:

type(scope): short description

Example:

feat(auth): implement JWT login flow
feat(workouts): create workout session entity
fix(api): correct graphql resolver return type
chore(database): update prisma migration
docs(readme): update setup instructions

---

# Commit Scope Rules

Use domain-based scopes.

Common scopes:

auth
users
workouts
sessions
progression
database
api
web
workspace
docs

Example:

feat(auth): implement register mutation
feat(workouts): create workout entity
fix(api): correct graphql resolver typing

---

# Commit Size Rules

Commits should represent a logical feature or improvement.

Avoid:

❌ very granular commits  
❌ commits per file  
❌ commits per line change

Prefer:

✔ one commit per feature  
✔ one commit per architectural change  
✔ one commit per module

Good example:

feat(auth): implement register and login with jwt
