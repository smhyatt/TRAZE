SELECT 
  A.id as id, 
  B.id as id2,
  ST_AsText(A.area) as area,
  ST_AsText(B.area) as areaB,
  ST_Equals(A.area, B.area) as equal,
  A.end_time as Aendtime,
  B.start_time as Bstarttime,
  B.end_time as Bendtime,
  Date(A.end_time) = Date(B.start_time) AND A.start_time < B.start_time as endTimeEqualsStartTime
FROM
  carbon_credit_certificate A
  LEFT JOIN
  carbon_credit_certificate B 
  ON A.id <> B.id
WHERE ST_Intersects(A.area,B.area);
