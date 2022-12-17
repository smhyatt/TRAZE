update Ownership(agent, type, amount)
set amount = $[amount]
WHERE agent = $[agent] and type = $[type];
