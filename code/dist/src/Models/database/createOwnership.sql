insert into Ownership(agent, type, amount)
values (${agent}, ${type}, ${amount})
returning *;
