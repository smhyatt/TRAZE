begin;

insert into Transfer(transferor, transferee, type, amount, time_of_effect, info)


values (${transferor}, ${transferee}, ${type}, ${amount}, ${time_of_effect}, ${info});


commit;


do $$
declare
    sum_res float;
begin  

    select amount from transfer
    into sum_res
    where transferee = (select id from agent where name='sarah');
  
  	if not found then
    	raise notice'The film % could not be found', 
	    sum_res;
  	end if;
end $$





-- * What is a database transaction
-- * A database transaction is a single unit of work that consists of one or more operations.

-- * A classical example of a transaction is a bank transfer from one account to another. A complete transaction must ensure a balance between the sender and receiver accounts. It means that if the sender account transfers X amount, the receiver receives X amount, no more or no less.

-- * A PostgreSQL transaction is atomic, consistent, isolated, and durable. These properties are often referred to as ACID:

-- * Atomicity guarantees that the transaction completes in an all-or-nothing manner.
-- * Consistency ensures the change to data written to the database must be valid and follow predefined rules.
-- * Isolation determines how transaction integrity is visible to other transactions.
-- * Durability makes sure that transactions that have been committed will be stored in the database permanently.
