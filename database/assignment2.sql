-- 1. Insert Tony Stark into the account table
INSERT INTO account ("account_firstname", "account_lastname", "account_email", "account_password")
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- 2. Update Tony Stark’s account_type to Admin
UPDATE account
SET account_type = 'Admin'
WHERE "account_email" = 'tony@starkent.com';

-- 3. Delete Tony Stark’s record
DELETE FROM account
WHERE "account_email" = 'tony@starkent.com';

-- 4. Modify GM Hummer description from "small interiors" to "a huge interior"
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- 5. Use an INNER JOIN to get make, model, and classification for Sport vehicles
SELECT i.inv_make, i.inv_model, c.classification_name
FROM inventory i
INNER JOIN classification c
  ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

-- 6. Update all inv_image and inv_thumbnail paths to include /vehicles
  UPDATE inventory
  SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
      inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');