SELECT id, name, ST_AsText(location) as location
FROM Location
WHERE id = $1;
