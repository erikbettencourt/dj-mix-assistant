/*
  # Add sample tracks data
  
  1. Changes
    - Insert sample tracks with metadata from popular music stores
    - Include purchase URLs and preview URLs
    - Add genre information
*/

INSERT INTO tracks (title, artist, bpm, key, price, purchase_url, preview_url, genre) VALUES
  ('Strobe', 'deadmau5', 128, '11B', 2.99, 'https://www.beatport.com/track/strobe/1229545', 'https://geo-samples.beatport.com/track/7b43a4c3-5355-4795-a5c1-7a4fae5d6e9c.LOFI.mp3', 'Progressive House'),
  ('Ghosts n Stuff', 'deadmau5', 128, '11A', 2.49, 'https://www.beatport.com/track/ghosts-n-stuff-original-mix/1229545', 'https://geo-samples.beatport.com/track/7b43a4c3-5355-4795-a5c1-7a4fae5d6e9c.LOFI.mp3', 'Progressive House'),
  ('Around The World', 'Daft Punk', 123, '6B', 1.99, 'https://www.beatport.com/track/around-the-world/1229545', 'https://geo-samples.beatport.com/track/7b43a4c3-5355-4795-a5c1-7a4fae5d6e9c.LOFI.mp3', 'House'),
  ('One More Time', 'Daft Punk', 123, '2B', 1.99, 'https://www.beatport.com/track/one-more-time/1229545', 'https://geo-samples.beatport.com/track/7b43a4c3-5355-4795-a5c1-7a4fae5d6e9c.LOFI.mp3', 'House'),
  ('Faded', 'ZHU', 125, '5A', 2.99, 'https://www.beatport.com/track/faded/1229545', 'https://geo-samples.beatport.com/track/7b43a4c3-5355-4795-a5c1-7a4fae5d6e9c.LOFI.mp3', 'Deep House'),
  ('Language', 'Porter Robinson', 128, '8B', 2.49, 'https://www.beatport.com/track/language/1229545', 'https://geo-samples.beatport.com/track/7b43a4c3-5355-4795-a5c1-7a4fae5d6e9c.LOFI.mp3', 'Progressive House'),
  ('Opus', 'Eric Prydz', 127, '12B', 2.99, 'https://www.beatport.com/track/opus/1229545', 'https://geo-samples.beatport.com/track/7b43a4c3-5355-4795-a5c1-7a4fae5d6e9c.LOFI.mp3', 'Progressive House'),
  ('Clarity', 'Zedd', 128, '8B', 1.99, 'https://www.beatport.com/track/clarity/1229545', 'https://geo-samples.beatport.com/track/7b43a4c3-5355-4795-a5c1-7a4fae5d6e9c.LOFI.mp3', 'Progressive House'),
  ('Wake Me Up', 'Avicii', 124, '11B', 2.49, 'https://www.beatport.com/track/wake-me-up/1229545', 'https://geo-samples.beatport.com/track/7b43a4c3-5355-4795-a5c1-7a4fae5d6e9c.LOFI.mp3', 'Progressive House'),
  ('Animals', 'Martin Garrix', 128, '11A', 2.99, 'https://www.beatport.com/track/animals/1229545', 'https://geo-samples.beatport.com/track/7b43a4c3-5355-4795-a5c1-7a4fae5d6e9c.LOFI.mp3', 'Big Room House');