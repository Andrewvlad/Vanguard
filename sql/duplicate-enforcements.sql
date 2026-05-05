-- Find duplicate enforcements query
-- Returns: every duplicate enforcement within a rolling ±24 hour window (within the same lot)
--
-- Suggested index: (plate, lot_id, issued_at). Switch to a window function if not indexing

-- NOTE: This query checks over all time, otherwise you can append the outer WHERE with:
--      "AND original.issued_at >= now() - INTERVAL '7 days'" -- Planner would prefer this as the first WHERE conditional
SELECT original.*
FROM enforcements original
WHERE EXISTS (
    SELECT 1
    FROM enforcements dupes
    WHERE dupes.plate = original.plate
        AND dupes.lot_id = original.lot_id
        AND dupes.id <> original.id
        -- NOTE: Between IS inclusive - https://www.postgresql.org/docs/current/functions-comparison.html
        AND dupes.issued_at BETWEEN original.issued_at - INTERVAL '24 hours' AND original.issued_at + INTERVAL '24 hours'
);
