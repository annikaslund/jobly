process.env.NODE_ENV = "test"
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
});
// test POST /companies
// test PATCH /companies/:handle
// test DELETE /companies/:handle
afterEach(async function(){
    await db.query(`DELETE FROM companies`);
})
// after all 
   // close the connection to db
afterAll(async function(){
    await db.end()
})
