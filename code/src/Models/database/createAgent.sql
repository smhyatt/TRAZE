insert into Agent(id, name, type, key)
values ($[id], $[name], $[type], $[key])
returning *;
