select t.transferor as agent, rt.id as type, -t.amount*rt.valuation as amount from transfer as t
join resource_type as rt on t.type = rt.id

union

select t.transferee as agent, rt.id as type, t.amount*rt.valuation as amount from transfer as t
join resource_type as rt on t.type = rt.id;

