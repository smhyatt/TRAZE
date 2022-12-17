insert into Location(id, name, location)
values ($[id], $[name], ST_GeometryFromText($[location]))
returning id;