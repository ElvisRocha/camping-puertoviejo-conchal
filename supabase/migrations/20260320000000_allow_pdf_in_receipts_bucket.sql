-- Allow PDF uploads in the payment-receipts bucket.
-- The bucket may have been created (via dashboard or earlier migration) with
-- allowed_mime_types restricted to images only. Setting it to NULL removes
-- all MIME-type restrictions, allowing JPEG, PNG, WEBP and PDF uploads.
UPDATE storage.buckets
SET allowed_mime_types = NULL
WHERE id = 'payment-receipts';
