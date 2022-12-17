-- Define all tables for the database

create table Agent(
    id uuid,
    name text not null,
    type text not null,
    key varchar(40) not null unique, -- Should be a candidate key?
    PRIMARY KEY (id)
);

create table Resource_Type(
    id uuid,
    name text not null,
    valuation float not null, -- i.e. 20000 g or 24 CO2-eq
    PRIMARY KEY (id)
);

create table Carbon_Credit_Certificate(
    id uuid not null references Resource_Type(id),
    area GEOMETRY(polygon, 26911) not null,
    start_time timestamptz not null,
    end_time timestamptz not null,
    evidence json,
    PRIMARY KEY (id)
);

CREATE INDEX carbon_credit_certificate_gix
  ON Carbon_Credit_Certificate
  USING GIST (area);

create table Transfer(
    id uuid,
    transferor uuid not null references Agent(id),
    transferee uuid not null references Agent(id),
    type uuid not null references Resource_Type(id),
    amount float not null,
    time_of_effect timestamptz not null,
    info json,
    PRIMARY KEY (id, transferor, transferee, type)
);

-- CC_Retire is a table containing specialized transfers
-- btwn. an agent and the atmosphere w.r.t. carbon credits
create table CC_Retire(
    id uuid,
    transferor uuid not null references Agent(id),
    type uuid not null references Resource_Type(id),
    amount float not null,
    time_of_effect timestamptz,
    PRIMARY KEY (id, transferor, type)
);

-- agent and type must be composite primary keys
-- in order to perform UPSERT operations.
create table Ownership(
    agent uuid not null references Agent(id),
    type uuid not null references Resource_Type(id),
    amount float not null,
    PRIMARY KEY (agent, type)
);

-- Create table with spatial column
create table Location(
    id uuid,
    name text,
    location GEOMETRY(point, 26910),
    PRIMARY KEY (id)
);

CREATE INDEX location_gix
  ON Location
  USING GIST (location);

create table Location_State(
    location_id uuid not null references Location(id),
    resource_type uuid not null references Resource_Type(id),
    amount float not null,
    PRIMARY KEY (location_id, resource_type)
);

create table Transport(
    id uuid,
    owner uuid not null references Agent(id),
    location_start uuid not null references Location(id),
    destination uuid not null references Location(id),
    resource_type uuid not null references Resource_Type(id),
    amount float not null,
    time_of_effect timestamptz not null,
    distance float,
    PRIMARY KEY (id, owner, location_start, destination, resource_type)
);

create table Transformation(
    id uuid,
    owner uuid not null references Agent(id),
    time_of_effect timestamptz not null,
    info json,
    PRIMARY KEY (id)
);

create table Transformation_Input(
    transformation uuid not null references Transformation(id),
    type uuid not null references Resource_Type(id),
    amount float not null
);

create table Transformation_Output(
    transformation uuid not null references Transformation(id),
    type uuid not null references Resource_Type(id),
    amount float not null
);

create table Credit_Limit(
    agent uuid not null references Agent(id),
    type uuid not null references Resource_Type(id),
    credit_limit float not null
);

