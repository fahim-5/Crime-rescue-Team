I’m going to quickly scan your backend’s database configuration and a couple of representative model files to understand how MySQL is wired in today, so I can point you to the exact places to change for MongoDB.
Read file: backend/config/db.js
Read file: backend/config/database.js
Read file: backend/models/userModel.js
Read file: backend/models/reportModel.js
Read file: backend/package.json

Read file: backend/server.js

Just scanned your backend: you’re using a MySQL pool in `backend/config/db.js` (and a Sequelize config in `backend/config/database.js`, though models mostly use raw MySQL via the pool). Controllers call methods in `backend/models/*.js` that run SQL queries and transactions.

### What you need to change to move to MongoDB (brief checklist)

- Backend dependencies
  - Remove: `mysql2`, `sequelize`
  - Add: `mongoose` (or official `mongodb` driver if you prefer low-level)

- Connection layer
  - Replace `backend/config/db.js` with a Mongo connection (Mongoose `connect`) and export the connection.
  - Remove or stop using `backend/config/database.js` (Sequelize).
  - Update `backend/server.js` to await Mongo connection before `app.listen`.

- Models (biggest change)
  - Every file in `backend/models/*.js` currently builds SQL strings and uses `pool.query`. Replace these with Mongoose models and methods.
  - Start with the most-used:
    - `userModel.js`
    - `reportModel.js`
    - Then: `crimeAlertModel.js`, `commentModel.js`, `notificationModel.js`, `requestModel.js`, `policeModel.js`, `policeFileModel.js`, `analyticsModel.js`
  - Replace:
    - INSERT/UPDATE/DELETE/SELECT → `Model.create`, `find`, `findOne`, `updateOne`, `deleteOne`, `aggregate`
    - SQL JOINs (e.g., report + validations/users) → either:
      - Embed subdocuments, or
      - Use references and multiple queries / aggregation pipelines (`$lookup`)
    - JSON fields stored as strings (e.g., `photos`, `videos`) → native arrays in Mongo (remove `JSON.stringify`/`JSON.parse`)
    - Auto-increment `id` → Mongo `_id` (`ObjectId`); adjust code to use `_id` as string

- Transactions and constraints
  - SQL transactions (`beginTransaction/commit/rollback` in `userModel.js`, `reportModel.js`) → Mongo transactions with sessions (requires replica set) or redesign to single-document atomic writes.
  - Unique checks (email/username/national_id) → define unique indexes in Mongoose schemas + handle duplicate key errors.

- Controllers and services
  - Keep the controller interfaces the same if possible; only change their calls to use new Mongoose model methods.
  - Revisit any raw SQL in controllers (most logic is in models, which is good).

- Migrations/seed
  - Replace `backend/migrations/*.sql` and `backend/scripts/*.sql` with a simple Node script that creates indexes and seeds starter data via Mongoose.

- ENV
  - Replace `DB_HOST/DB_NAME/DB_USER/DB_PASSWORD` with a single `MONGODB_URI` (e.g., `mongodb://localhost:27017/Crime_Rescue_BD`).
  - Update `.env` and any code that reads the old vars.

- Frontend
  - Likely no changes if API responses stay the same.
  - Watch for `id` type changes (`number` → string `_id`). If your API currently returns `id`, you can map `_id` to `id` in controllers to avoid frontend changes.

- Indexes you’ll want early
  - Users: `email` (unique), `username` (unique), `national_id` (unique)
  - Reports: fields used in filters like `location`, `crime_type`, `time`, plus any `report_id` references in related collections
  - Validations: compound indexes on `(report_id, user_id)` to enforce one validation per user per report

- Files to touch immediately
  - `backend/config/db.js`: switch to Mongo connect
  - `backend/server.js`: wait for Mongo connect
  - `backend/models/userModel.js`: rewrite to Mongoose
  - `backend/models/reportModel.js`: rewrite to Mongoose
  - Then proceed model-by-model

If you want, I can start by replacing `backend/config/db.js` with a Mongoose connection and create a minimal `User` and `Report` schema to match your current data and keep controller interfaces unchanged.