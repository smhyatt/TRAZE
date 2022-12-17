insert into Transfer(id, transferor, transferee, type, amount, time_of_effect, info)
values (${id}, ${transferor}, ${transferee}, ${type}, ${amount}, ${time_of_effect}, ${info})
returning *;
