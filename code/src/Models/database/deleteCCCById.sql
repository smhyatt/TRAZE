DELETE FROM Carbon_Credit_Certificate WHERE id = $1 RETURNING id;
