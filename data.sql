DROP TABLE IF EXISTS companies;

CREATE TABLE companies (
    handle text PRIMARY KEY, 
    name text NOT NULL UNIQUE, 
    num_employees INTEGER, 
    description text,
    logo_url text
);

INSERT INTO companies (handle, name, num_employees, description, logo_url)
VALUES ('RIT', 'Rithm', 8, 'Computer school', 'https://www.rithmschool.com/assets/logos/rithm_logo-52c2ff4eb53876f905ff2d8b1d46b5ec737caa4d9f9acf4790dcd856f3ccc638.svg');

INSERT INTO companies (handle, name, num_employees, description, logo_url)
VALUES ('APP', 'apple', 7777, 'Fruit Producing company', 'https://www.rithmschool.com/assets/logos/rithm_logo-52c2ff4eb53876f905ff2d8b1d46b5ec737caa4d9f9acf4790dcd856f3ccc638.svg');

CREATE TABLE jobs (
    id SERIAL PRIMARY KEY, 
    title text NOT NULL, 
    salary float NOT NULL, 
    equity float NOT NULL CHECK(equity <= 1.0), 
    company_handle text NOT NULL REFERENCES companies, 
    date_posted timestamp without time zone
);