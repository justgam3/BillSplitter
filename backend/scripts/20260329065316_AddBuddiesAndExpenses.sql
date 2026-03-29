START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20260329065316_AddBuddiesAndExpenses') THEN
    CREATE TABLE buddies (
        id uuid NOT NULL,
        owner_id uuid NOT NULL,
        email character varying(255) NOT NULL,
        nickname character varying(100),
        linked_user_id uuid,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        CONSTRAINT pk_buddies PRIMARY KEY (id),
        CONSTRAINT fk_buddies_users_linked_user_id FOREIGN KEY (linked_user_id) REFERENCES users (id) ON DELETE SET NULL,
        CONSTRAINT fk_buddies_users_owner_id FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20260329065316_AddBuddiesAndExpenses') THEN
    CREATE TABLE expenses (
        id uuid NOT NULL,
        created_by_user_id uuid NOT NULL,
        description character varying(500) NOT NULL,
        amount numeric(18,2) NOT NULL,
        currency_code character varying(3) NOT NULL,
        split_type integer NOT NULL,
        paid_by_user_id uuid,
        paid_by_buddy_id uuid,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        CONSTRAINT pk_expenses PRIMARY KEY (id),
        CONSTRAINT fk_expenses_buddies_paid_by_buddy_id FOREIGN KEY (paid_by_buddy_id) REFERENCES buddies (id) ON DELETE SET NULL,
        CONSTRAINT fk_expenses_users_created_by_user_id FOREIGN KEY (created_by_user_id) REFERENCES users (id) ON DELETE RESTRICT,
        CONSTRAINT fk_expenses_users_paid_by_user_id FOREIGN KEY (paid_by_user_id) REFERENCES users (id) ON DELETE SET NULL
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20260329065316_AddBuddiesAndExpenses') THEN
    CREATE TABLE expense_splits (
        id uuid NOT NULL,
        expense_id uuid NOT NULL,
        user_id uuid,
        buddy_id uuid,
        amount numeric(18,2) NOT NULL,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        CONSTRAINT pk_expense_splits PRIMARY KEY (id),
        CONSTRAINT fk_expense_splits_buddies_buddy_id FOREIGN KEY (buddy_id) REFERENCES buddies (id) ON DELETE SET NULL,
        CONSTRAINT fk_expense_splits_expenses_expense_id FOREIGN KEY (expense_id) REFERENCES expenses (id) ON DELETE CASCADE,
        CONSTRAINT fk_expense_splits_users_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20260329065316_AddBuddiesAndExpenses') THEN
    CREATE UNIQUE INDEX idx_buddies_owner_email ON buddies (owner_id, email);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20260329065316_AddBuddiesAndExpenses') THEN
    CREATE INDEX ix_buddies_linked_user_id ON buddies (linked_user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20260329065316_AddBuddiesAndExpenses') THEN
    CREATE INDEX ix_expense_splits_buddy_id ON expense_splits (buddy_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20260329065316_AddBuddiesAndExpenses') THEN
    CREATE INDEX ix_expense_splits_expense_id ON expense_splits (expense_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20260329065316_AddBuddiesAndExpenses') THEN
    CREATE INDEX ix_expense_splits_user_id ON expense_splits (user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20260329065316_AddBuddiesAndExpenses') THEN
    CREATE INDEX ix_expenses_created_by_user_id ON expenses (created_by_user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20260329065316_AddBuddiesAndExpenses') THEN
    CREATE INDEX ix_expenses_paid_by_buddy_id ON expenses (paid_by_buddy_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20260329065316_AddBuddiesAndExpenses') THEN
    CREATE INDEX ix_expenses_paid_by_user_id ON expenses (paid_by_user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20260329065316_AddBuddiesAndExpenses') THEN
    INSERT INTO "__EFMigrationsHistory" (migration_id, product_version)
    VALUES ('20260329065316_AddBuddiesAndExpenses', '10.0.5');
    END IF;
END $EF$;
COMMIT;

