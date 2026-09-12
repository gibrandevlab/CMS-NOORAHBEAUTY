# AI Agent Context

## General Application Concept

- Project name: CMS Berita
- Purpose: manage company news, product catalog, vendors, and company profile.
- Admin interface: AdminLTE-based protected administration area.
- Public interface: read-only pages backed by public API.
- Backend architecture: Express REST API with JWT-protected admin routes and public guest routes.

## Roles and Access

### ADMIN

- Full CRUD access to categories, news, products, vendors, and company profile.
- May view dashboard statistics.
- Must authenticate with username and password before accessing admin endpoints.

### Guest

- Read-only access through public API.
- May view company profile, published news, and active products.
- Must not create, update, or delete data.

## MVP Scope

- Admin login with username and password.
- Password hashing with bcrypt and JWT token authentication.
- Admin logout by discarding the client-side JWT token.
- Dashboard statistics:
  - Total news
  - Total products
  - Total categories
  - Total vendors
- Master data modules:
  - Category CRUD
  - News CRUD
  - Product CRUD
  - Vendor CRUD
  - Company profile management
- Public modules:
  - Company profile or landing page
  - News listing/detail page
  - Product catalog

## Security and File Uploads

- Admin API routes must verify the `Authorization: Bearer <JWT>` header.
- Hash passwords with `bcryptjs`; the planned default seed uses 10 salt rounds.
- Uploaded images are limited to `.png`, `.jpg`, and `.jpeg` formats and must have a configured size limit.
- Store uploaded files under the backend storage directory.
- Delete the associated physical image when its news or product record is deleted.
- Validate MIME type, extension, file size, and ownership before accepting uploads.
- Never commit database passwords, JWT secrets, or admin passwords to source control.

## Planned Backend Dependencies

Already used or required by the backend:

- `express`
- `cors`
- `dotenv`
- `jsonwebtoken`
- `bcryptjs`
- `mysql2`
- `sequelize`

Planned for the MVP:

- `multer` for image uploads
- `slugify` for generating URL slugs from news and product titles

## Default Admin Account

The development seed may create this account:

- Username: `ADMIN`
- Email: `admin@ptgibran.com`
- Password: supplied through a private environment variable or seed prompt
- Hash algorithm: bcrypt with 10 salt rounds

The plaintext password `admin123` must not be stored in `ai.md`, source code, committed seed files, logs, or API responses. Change the development password before any deployment.

## Project

- Backend: Node.js, Express, Sequelize ORM
- Database: MySQL
- Database name: `db_pt_gibran`
- Database host: `127.0.0.1`
- Database port: `3306`
- Database user: `root`
- Backend source: `backend/src`
- Model directory: `backend/src/models`
- Database configuration: `backend/src/config/db.js`

## Database Rules

- Do not use `sequelize.sync({ alter: true })` or `sequelize.sync({ force: true })` against the existing database.
- Preserve the existing table names and column names.
- Use Sequelize model definitions and associations from `backend/src/models/index.js`.
- Use environment variables for database credentials. Never hardcode passwords in source code.
- Use `created_at` and `updated_at` for tables that have both timestamps.
- `about_us` has only `updated_at`; it does not have `created_at`.
- Foreign keys use restrictive deletion and cascading updates.
- Do not expose the `users.password` field in API responses.

## Tables

### `about_us`

- Primary key: `id`, unsigned integer, auto increment
- `company_name`: string, default `PT Gibran`, required
- `description`: text, nullable
- `vision`: text, nullable
- `mission`: text, nullable
- `address`: text, nullable
- `phone`: string(50), nullable
- `email`: string(100), nullable, valid email format
- Timestamp: `updated_at`

### `categories`

- Primary key: `id`, unsigned integer, auto increment
- `name`: string(100), required
- `slug`: string(255), required, unique
- `type`: enum `NEWS` or `PRODUCT`, default `NEWS`
- Timestamps: `created_at`, `updated_at`
- Relations:
  - Has many `news` through `category_id`
  - Has many `products` through `category_id`

### `news`

- Primary key: `id`, unsigned integer, auto increment
- `category_id`: unsigned integer, required, foreign key to `categories.id`
- `title`: string(255), required
- `slug`: string(255), required, unique
- `content`: long text, required
- `image`: string(255), nullable
- `is_published`: boolean/tinyint, default `true`
- Timestamps: `created_at`, `updated_at`
- Relation: belongs to `Category` through `category_id`
- Foreign key rules: `ON DELETE RESTRICT`, `ON UPDATE CASCADE`

### `products`

- Primary key: `id`, unsigned integer, auto increment
- `category_id`: unsigned integer, required, foreign key to `categories.id`
- `name`: string(255), required
- `slug`: string(255), required, unique
- `description`: text, nullable
- `price`: decimal(15,2), default `0.00`, minimum `0`
- `image`: string(255), nullable
- `is_active`: boolean/tinyint, default `true`
- Timestamps: `created_at`, `updated_at`
- Relation: belongs to `Category` through `category_id`
- Foreign key rules: `ON DELETE RESTRICT`, `ON UPDATE CASCADE`

### `users`

- Primary key: `id`, unsigned integer, auto increment
- `username`: string(50), required, unique
- `email`: string(100), required, unique, valid email format
- `password`: string(255), required, sensitive
- Timestamps: `created_at`, `updated_at`
- Password must be hashed with bcrypt before saving.
- Password must be excluded from normal queries and JSON serialization.
- Use the `withPassword` scope only when authentication explicitly needs the password hash.

### `vendors`

- Primary key: `id`, unsigned integer, auto increment
- `name`: string(255), required
- `logo`: string(255), nullable
- `address`: text, nullable
- `contact`: string(100), nullable
- Timestamps: `created_at`, `updated_at`

## Model Conventions

- Use explicit attribute definitions as the mass-assignment whitelist.
- Keep validation rules in Sequelize model definitions.
- Cast `is_published` and `is_active` to boolean.
- Cast `price` to a JavaScript number when reading it from the model.
- Use association aliases:
  - `Category.associations.news`
  - `Category.associations.products`
  - `News.associations.category`
  - `Product.associations.category`
- Keep model exports centralized in `backend/src/models/index.js`.
- Do not change database schema or delete data without explicit user approval.

## Environment Variables

The local backend uses these variables in `backend/.env`:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=db_pt_gibran
DB_USER=root
DB_PASSWORD=
```

Credentials belong in `.env`, which must not be committed. Use `backend/.env.example` as the safe template.
