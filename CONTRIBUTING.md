# Contributing to Travel-Doc

Thank you for your interest in contributing to **Travel-Doc**! This guide details development workflows, standards, and conventions.

---

## 1. Code of Conduct
We are committed to providing a welcoming, inclusive, and harassment-free experience for everyone. Be respectful and constructive in all discussions.

---

## 2. Getting Started
1. Clone the repository and navigate into the `Travel-Doc` root.
2. Follow installation instructions in the [Root README](README.md).
3. Ensure Microsoft SQL Server is installed, running, and accessible.
4. Set up `.env` files for both `frontend/` and `backend/` from their respective `.env.example`.
5. Run the database setup script located in `database/schema.sql` (or `scripts/setup-db.js`).

---

## 3. Branch Naming & Git Conventions
- `feature/<short-description>` - For new features
- `fix/<short-description>` - For bug fixes
- `docs/<short-description>` - For documentation updates
- `refactor/<short-description>` - For code refactoring without behavior changes
- `test/<short-description>` - For testing improvements

### Commit Messages
Use the Conventional Commits format:
- `feat(wishlist): add priority filtering and sort by distance`
- `fix(routing): prevent crash on single stop route calculation`
- `docs(api): document photo upload endpoint multipart requirements`
- `test(backend): add unit tests for Haversine distance calculator`

---

## 4. Coding Standards
- **JavaScript**: Modern ES Modules (`import`/`export`), Node.js 18+.
- **Frontend**: Functional React components with hooks. Use Tailwind CSS for styling. Never mix raw inline CSS when Tailwind utilities apply.
- **Backend**: Layered architecture: Route -> Controller -> Service -> Repository -> Database.
- **Error Handling**: Centralized Express error handler. Never expose raw SQL exceptions or stack traces to API clients.
- **Validation**: Validate all inputs using express-validator / Zod.
- **Security**: Parameterized SQL queries via `mssql`. Sanitize file uploads and restrict MIME types (`image/jpeg`, `image/png`, `image/webp`).

---

## 5. Testing Requirements
Before submitting changes:
- Run frontend tests: `npm test` inside `frontend/`
- Run backend tests: `npm test` inside `backend/`
- Ensure no lint or syntax errors.

---

## 6. Documentation Expectations
Whenever an API endpoint, data model, or major feature changes:
- Update `docs/API_DOCUMENTATION.md`
- Update `docs/DATABASE_SCHEMA.md`
- Update `docs/REQUIREMENTS.md` and `docs/IMPLEMENTATION_PLAN.md`
- Record changes in `docs/DEVELOPMENT_LOG.md`
