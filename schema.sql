
-- Drop existing tables if they exist (to reset the database)
DROP TABLE IF EXISTS follows;
DROP TABLE IF EXISTS entries;
DROP TABLE IF EXISTS songs;
DROP TABLE IF EXISTS moods;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- Moods table
CREATE TABLE moods (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT
);

-- Songs table
CREATE TABLE songs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  url TEXT
);

-- Entries table
CREATE TABLE entries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  mood_id INTEGER NOT NULL REFERENCES moods(id),
  song_id INTEGER REFERENCES songs(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  journal_text TEXT
);

-- Follows table (self-referencing join table)
CREATE TABLE follows (
  id SERIAL PRIMARY KEY,
  following_user_id INTEGER NOT NULL REFERENCES users(id),
  followed_user_id INTEGER NOT NULL REFERENCES users(id)
);
