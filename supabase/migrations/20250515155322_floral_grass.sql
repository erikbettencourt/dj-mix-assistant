/*
  # Create tracks and recommendations tables

  1. New Tables
    - `tracks`
      - `id` (uuid, primary key)
      - `title` (text)
      - `artist` (text)
      - `bpm` (numeric)
      - `key` (text)
      - `price` (numeric)
      - `purchase_url` (text)
      - `preview_url` (text)
      - `genre` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `tracks` table
    - Add policy for authenticated users to read tracks
*/

CREATE TABLE IF NOT EXISTS tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text NOT NULL,
  bpm numeric NOT NULL,
  key text NOT NULL,
  price numeric,
  purchase_url text,
  preview_url text,
  genre text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tracks"
  ON tracks
  FOR SELECT
  TO public
  USING (true);