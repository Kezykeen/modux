-- Deduplicate collection names per user before adding the unique constraint.
WITH ranked AS (
  SELECT
    id,
    name,
    ROW_NUMBER() OVER (PARTITION BY "userId", LOWER(name) ORDER BY "updatedAt" DESC) AS rn
  FROM "collections"
)
UPDATE "collections" AS c
SET name = c.name || ' (' || r.rn || ')'
FROM ranked AS r
WHERE c.id = r.id AND r.rn > 1;

CREATE UNIQUE INDEX "collections_userId_name_key" ON "collections"("userId", "name");
