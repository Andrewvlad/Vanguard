-- Race-safe balance debit
-- Returns: [{id, balance_cents}]
--
-- No need to add any locking, as UPDATE locks the row when in progress
-- If you were looking to add locking, you could use SELECT FOR UPDATE, then UPDATE
--  but that would be overkill for this query
--
-- Suggested index: id (this should be already indexed as a PK)

UPDATE parking_sessions
SET balance_cents = balance_cents - 100
WHERE id = $1
    AND balance_cents >= 100
RETURNING id, balance_cents;
