insert into Resource_Type(id, name, valuation)
values ($[id], $[name], $[valuation])
returning *;
