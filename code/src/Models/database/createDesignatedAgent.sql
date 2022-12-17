insert into Agent(id, name, type, key)
values ($[id], $[name], $[type], $[key])
ON CONFLICT DO NOTHING
returning *;
