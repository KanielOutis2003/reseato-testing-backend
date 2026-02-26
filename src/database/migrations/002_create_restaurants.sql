-- 002_create_restaurants.sql

-- Extensions (safe if already enabled)
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- 1) Create table (initial definition)
CREATE TABLE IF NOT EXISTS restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cuisine_type VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2) If restaurants table already existed from a previous run,
-- ensure latitude/longitude exist before creating indexes
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- 3) Create indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_restaurants_owner
  ON restaurants(owner_id);

CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine
  ON restaurants(cuisine_type);

CREATE INDEX IF NOT EXISTS idx_restaurants_rating
  ON restaurants(rating DESC);

CREATE INDEX IF NOT EXISTS idx_restaurants_active
  ON restaurants(is_active);

-- 4) Location index only if both columns exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'latitude'
  )
  AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'longitude'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_restaurants_location
             ON restaurants
             USING gist (ll_to_earth(latitude, longitude))';
  END IF;
END $$;

-- 5) updated_at trigger (create only if missing)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_restaurants_updated_at') THEN
    CREATE TRIGGER update_restaurants_updated_at
      BEFORE UPDATE ON restaurants
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- 6) restaurant_images table + indexes
CREATE TABLE IF NOT EXISTS restaurant_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_restaurant_images_restaurant
  ON restaurant_images(restaurant_id);

CREATE INDEX IF NOT EXISTS idx_restaurant_images_primary
  ON restaurant_images(is_primary);
