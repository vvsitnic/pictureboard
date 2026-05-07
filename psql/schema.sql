CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS "user" (
	"id" text NOT NULL PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"emailVerified" boolean NOT NULL,
	"image" text,
	"createdAt" timestamptz NOT NULL,
	"updatedAt" timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS "session" (
	"id" text NOT NULL PRIMARY KEY,
	"userId" text NOT NULL,
	"token" text NOT NULL UNIQUE,
	"expiresAt" timestamptz NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"createdAt" timestamptz NOT NULL,
	"updatedAt" timestamptz NOT NULL,
	FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
	"id" text NOT NULL PRIMARY KEY,
	"userId" text NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"accessTokenExpiresAt" timestamptz,
	"refreshTokenExpiresAt" timestamptz,
	"scope" text,
	"idToken" text,
	"password" text,
	"createdAt" timestamptz NOT NULL,
	"updatedAt" timestamptz NOT NULL,
	FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "verification" (
	"id" text NOT NULL PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamptz NOT NULL,
	"createdAt" timestamptz NOT NULL,
	"updatedAt" timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS "pictures" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" text NOT NULL,
    "picture_id" TEXT NOT NULL,
    "width" SMALLINT NOT NULL,
    "height" SMALLINT NOT NULL,
    "text_for_picture" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE
);