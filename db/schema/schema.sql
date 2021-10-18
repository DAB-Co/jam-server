BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "accounts" (
	"id"	INTEGER NOT NULL UNIQUE,
	"email"	TEXT UNIQUE,
	"username"	TEXT UNIQUE,
	"password"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "matches" (
	"id"	INTEGER NOT NULL UNIQUE,
	"connections"	BLOB,
	FOREIGN KEY("id") REFERENCES "accounts"("id"),
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "artists" (
	"id"	INTEGER NOT NULL UNIQUE,
	"api_id"	TEXT UNIQUE,
	"listeners"	BLOB,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "user_data" (
	"id"	INTEGER NOT NULL UNIQUE,
	"artists"	BLOB,
	FOREIGN KEY("id") REFERENCES "accounts"("id"),
	PRIMARY KEY("id" AUTOINCREMENT)
);
COMMIT;
