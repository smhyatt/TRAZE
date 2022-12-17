insert into Transport(id, owner, location_start, destination, resource_type, amount, time_of_effect)
values (${id}, ${owner}, ${location_start}, ${destination} ${resource_type}, ${amount}, ${time_of_effect})
returning id;
