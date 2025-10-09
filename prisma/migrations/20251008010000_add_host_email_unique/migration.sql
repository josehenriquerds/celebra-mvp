-- Add unique constraint for host email addresses
ALTER TABLE "hosts"
ADD CONSTRAINT "hosts_email_key" UNIQUE ("email");
