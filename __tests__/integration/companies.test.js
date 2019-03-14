process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../../app");
const db = require("../../db");

let company_handle;

beforeEach(async function(){
    let result = await db.query(`
        INSERT INTO companies (handle, name, num_employees, description, logo_url)
        VALUES ('TEST', 'testing', 10, 'testing description', 'test.jpeg')
        RETURNING handle`);
    
    company_handle = result.rows[0].handle;
});

// test GET /companies
describe("GET /companies", async function(){ 
    test("Gets a list of companies", async function() {
        const response = await request(app).get('/companies');
        const companies = response.body.companies;

        expect(response.statusCode).toBe(200);
        expect(companies).toHaveLength(1);
        expect(companies[0]).toHaveProperty('handle');
        expect(companies[0]).toHaveProperty('name');
    });

    test("Gets a company by name or handle", async function() {
        const response = await request(app).get('/companies?search=TEST');
        const companies = response.body.companies;

        expect(response.statusCode).toBe(200);
        expect(companies).toHaveLength(1);
        expect(companies[0].handle).toEqual('TEST');
        expect(companies[0].name).toEqual('testing');
    });

    test("Gets a list of companies by minimum number of employees", async function() {
        const response = await request(app).get('/companies?min_employees=1');
        const companies = response.body.companies;

        expect(response.statusCode).toBe(200);
        expect(companies).toHaveLength(1);
        expect(companies[0].handle).toEqual('TEST');
        expect(companies[0].name).toEqual('testing');
    });

    test("Gets an empty list when no records match query string", async function() {
        const response = await request(app).get('/companies?min_employees=11');
        const companies = response.body.companies;

        expect(response.statusCode).toBe(200);
        expect(companies).toHaveLength(0);
    });

    test("Gets a list of companies by maximum number of employees", async function() {
        const response = await request(app).get('/companies?max_employees=11');
        const companies = response.body.companies;

        expect(response.statusCode).toBe(200);
        expect(companies).toHaveLength(1);
        expect(companies[0].handle).toEqual('TEST');
        expect(companies[0].name).toEqual('testing');
    });

    test("Gets an empty list when no records match query string", async function() {
        const response = await request(app).get('/companies?max_employees=1');
        const companies = response.body.companies;

        expect(response.statusCode).toBe(200);
        expect(companies).toHaveLength(0);
    });
});

// test POST /companies
describe("POST /companies", async function(){ 
    test("Create a company and return the new company data", async function() {
        const response = await request(app)
        .post('/companies')
        .send({
            handle: "TEST2",
            name: "testing2",
            num_employees: 77,
            description: "testing des2", 
            logo_url: "test2.jpeg"
        });
        const company = response.body.company;

        expect(response.statusCode).toBe(200);
        expect(company).toHaveProperty('handle');
        expect(company.name).toEqual('testing2');
    });
});

// test PATCH /companies/:handle
describe("PATCH /companies/:handle", async function(){ 
    test("Update a company and return the updated company data", async function() {
        const response = await request(app)
        .patch('/companies/TEST')
        .send({
            name: "updatedTestCompany",
            num_employees: 101
        });
        const company = response.body.company;

        expect(response.statusCode).toBe(200);
        expect(company).toHaveProperty('name');
        expect(company.name).toEqual('updatedTestCompany');
        expect(company.num_employees).toEqual(101);
    });
});

// test DELETE /companies/:handle
describe("DELETE /companies/:handle", async function(){ 
    test("Delete a company returns a friendly message if sucessful.", async function() {
        const response = await request(app)
        .delete('/companies/TEST');
        const message = response.body.message;
        console.log(message);
        expect(response.statusCode).toBe(200);
        expect(message).toEqual('Company deleted');
    });

    test("Deleting a company that doesn't exist will return an error message.", async function() {
        const response = await request(app)
        .delete('/companies/DOESNOTEXIST');
        const message = response.body.message;
        console.log(message);
        expect(response.statusCode).toBe(404);
        expect(message).toEqual('Invalid handle');
    });
});


afterEach(async function(){
    await db.query(`DELETE FROM companies`);
})

// after all 
   // close the connection to db
afterAll(async function(){
    await db.end()
})
