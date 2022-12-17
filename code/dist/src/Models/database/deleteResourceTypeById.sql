DELETE FROM Resource_Type WHERE id = $1 RETURNING id;
