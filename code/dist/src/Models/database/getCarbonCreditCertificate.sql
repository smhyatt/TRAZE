SELECT *, ST_AsText(area) as area
FROM Carbon_Credit_Certificate
WHERE id = $1;