SELECT * 
FROM Transfer 
WHERE 
    (transferee = $1 AND transferor != '11111111-2222-3333-4444-555555555555')
    OR 
    (transferee != '11111111-2222-3333-4444-555555555555' AND transferor = $1);