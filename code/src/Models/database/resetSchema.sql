-- CLEANUP
drop table if exists
    Agent,
    Resource_Type,
    Carbon_Credit_Certificate,
    Transfer,
    CC_Retire,
    Ownership,
    Transport,
    Transformation,
    Transformation_Input,
    Transformation_Output,
    Credit_Limit,
    Location,
    Location_State
cascade;

