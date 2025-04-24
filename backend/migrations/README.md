# Database Migrations

This directory contains SQL migration files for database schema changes.

## Applying Migrations

To apply these migrations, you need to run the SQL scripts against your MySQL database.

### Migration: Add Reset Token Fields

This migration adds support for password reset functionality.

1. Connect to your MySQL database with appropriate credentials:

```bash
mysql -u your_username -p your_database_name
```

2. Execute the SQL script:

```bash
source /path/to/add_reset_token_fields.sql
```

Or you can use this command from the command line:

```bash
mysql -u your_username -p your_database_name < /path/to/add_reset_token_fields.sql
```

## Verification

After running the migration, you can verify the changes by checking the table structure:

```sql
DESCRIBE users;
```

You should see the following new columns:

- `reset_token` (VARCHAR, nullable)
- `reset_token_expiry` (DATETIME, nullable)
