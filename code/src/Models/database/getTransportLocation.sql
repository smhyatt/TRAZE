SELECT * FROM Location
WHERE id = (SELECT destination FROM Transport
            WHERE owner = $1 AND resource_type = $2
            ORDER BY time_of_effect ASC LIMIT 1);



-- SELECT *, (SELECT resource_type FROM Transport
--            WHERE owner = $1 AND resource_type = $2
--            ORDER BY time_of_effect ASC LIMIT 1) 
-- FROM Location
-- WHERE id = (SELECT destination FROM Transport
--             WHERE owner = $1 AND resource_type = $2
--             ORDER BY time_of_effect ASC LIMIT 1);


--------------------------

-- SELECT * FROM Location
-- WHERE id = (SELECT destination FROM Transport
--             WHERE owner = $1 AND resource_type = $2
--             ORDER BY time_of_effect ASC LIMIT 1);


-- SELECT resource_type, destination FROM Transport 
-- WHERE owner = $1 AND resource_type = $2
-- ORDER BY time_of_effect ASC LIMIT 1;
