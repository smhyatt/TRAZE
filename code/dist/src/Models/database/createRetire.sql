insert into CC_Retire(id, transferor, carbon_credit_certificate, amount, time_of_effect)
values (${id}, ${transferor}, ${carbon_credit_certificate}, ${amount}, ${time_of_effect})
returning id;
