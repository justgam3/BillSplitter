CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    migration_id character varying(150) NOT NULL,
    product_version character varying(32) NOT NULL,
    CONSTRAINT pk___ef_migrations_history PRIMARY KEY (migration_id)
);

START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20260329042125_InitialCreate') THEN
    CREATE TABLE users (
        id uuid NOT NULL,
        email character varying(255) NOT NULL,
        password_hash character varying(500) NOT NULL,
        is_email_verified boolean NOT NULL DEFAULT FALSE,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        CONSTRAINT pk_users PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20260329042125_InitialCreate') THEN
    CREATE TABLE email_verifications (
        id uuid NOT NULL,
        user_id uuid NOT NULL,
        verification_code character varying(6) NOT NULL,
        expires_at timestamp with time zone NOT NULL,
        is_used boolean NOT NULL DEFAULT FALSE,
        last_resent_at timestamp with time zone,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        CONSTRAINT pk_email_verifications PRIMARY KEY (id),
        CONSTRAINT fk_email_verifications_users_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20260329042125_InitialCreate') THEN
    CREATE INDEX idx_email_verifications_code ON email_verifications (verification_code);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20260329042125_InitialCreate') THEN
    CREATE INDEX idx_email_verifications_user_id ON email_verifications (user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20260329042125_InitialCreate') THEN
    CREATE UNIQUE INDEX idx_users_email ON users (email);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20260329042125_InitialCreate') THEN
    INSERT INTO "__EFMigrationsHistory" (migration_id, product_version)
    VALUES ('20260329042125_InitialCreate', '10.0.5');
    END IF;
END $EF$;
COMMIT;

