insert into Location(id, name, location)
values ($[id], $[name], ST_GeometryFromText($[location]))
ON CONFLICT DO NOTHING
returning id;
