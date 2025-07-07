-- CodeBoard Database Schema
-- Run this in Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create examples table
CREATE TABLE IF NOT EXISTS examples (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  text TEXT NOT NULL,
  languages TEXT[] NOT NULL,
  context TEXT,
  region TEXT,
  platform TEXT,
  age TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL
);

-- Create languages table
CREATE TABLE IF NOT EXISTS languages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL
);

-- Create regions table
CREATE TABLE IF NOT EXISTS regions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  UNIQUE(name, country)
);

-- Create platforms table
CREATE TABLE IF NOT EXISTS platforms (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT UNIQUE NOT NULL,
  description TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS examples_created_at_idx ON examples(created_at);
CREATE INDEX IF NOT EXISTS examples_languages_idx ON examples USING GIN(languages);
CREATE INDEX IF NOT EXISTS examples_region_idx ON examples(region);
CREATE INDEX IF NOT EXISTS examples_platform_idx ON examples(platform);

-- Update updated_at trigger for users
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();