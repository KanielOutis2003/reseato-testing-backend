CREATE TABLE IF NOT EXISTS restaurant_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_restaurant_payouts_restaurant_id ON restaurant_payouts(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_payouts_status ON restaurant_payouts(status);
