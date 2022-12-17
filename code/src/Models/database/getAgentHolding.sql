select o.agent, rt.id as type, o.amount from Resource_Type rt
join Ownership o
on o.type = rt.id
where o.agent = $1;


-- select r.id from Resource r
-- join Ownership o
-- on o.resource = r.id
-- where o.agent = $1;



-- select r.* from Resource r
-- join Transformation_Output t_out
-- on t_out.resource = r.id
-- join Transformation t
-- on t.id = t_out.transformation
-- left join Transfer_Input t_in
-- on t_in.resource = r.id
-- left join transformation_input ti
-- on ti.resource = r.id
-- where t_in.transfer is null and ti.transformation is null
-- and t.sender = $1
-- and r.type != 'WEIGHT_LOSS'

-- union

-- select r.* from resource r
-- join Transfer_Input t_in
-- on t_in.resource = r.id
-- join Transfer t
-- on t.id = t_in.transfer and t.recipient = $1
-- join Transfer_Confirmation t_con
-- on t_con.t_in = t.id
-- left join
--     (select t_in_sub.resource, t_sub.timestamp
--     from Transfer t_sub
--     join Transfer_Input t_in_sub
--     on t_sub.id = t_in_sub.transfer) t_out
-- on t_out.resource = r.id and t_out.timestamp > t.timestamp
-- left join Transformation_Input ti
-- on ti.resource = r.id
-- where t_out.timestamp is null and ti.transformation is null
-- and r.type != 'WEIGHT_LOSS';
