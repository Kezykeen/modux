-- Better Auth 1.7: accounts are keyed by (issuer, accountId)
ALTER TABLE "accounts" ADD COLUMN "issuer" TEXT;

UPDATE "accounts"
SET
  "issuer" = 'local:credential',
  "accountId" = "userId"
WHERE "providerId" = 'credential';

UPDATE "accounts"
SET "issuer" = CONCAT('local:oauth:', "providerId")
WHERE "issuer" IS NULL;

ALTER TABLE "accounts" ALTER COLUMN "issuer" SET NOT NULL;

CREATE UNIQUE INDEX "accounts_issuer_accountId_key" ON "accounts"("issuer", "accountId");
