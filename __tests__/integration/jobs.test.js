process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../../app");
const db = require("../../db");

beforeEach(async function(){
    let companyRes = await db.query(`
        INSERT INTO companies (handle, name, num_employees, description, logo_url)
        VALUES ('TEST', 'testing', 10, 'testing description', 'test.jpeg')
        RETURNING handle`
    );
    
    let jobRes = await db.query(`
        INSERT INTO jobs (id, title, salary, equity, company_handle, date_posted)
        VALUES (9000, 'test title', 50000, 0.5, 'TEST', current_timestamp)`
    );

    companyRes.rows[0].jobs = jobRes.rows;
});

// POST /jobs

describe("POST /jobs", async function(){ 
    test("Create a job and return the new job data", async function() {
        const response = await request(app)
        .post('/jobs')
        .send({
            title: "test2 title", 
            salary: 50000,
            equity: 0.5,
            company_handle: "TEST"
        });
        const job = response.body.job;

        expect(response.statusCode).toBe(200);
        expect(job).toEqual({
            "company_handle": "TEST",
            "date_posted": expect.any(String),
            "equity": 0.5,
            "id": expect.any(Number),
            "salary": 50000,
            "title": "test2 title"
        });
    });
});

// test GET /jobs
    describe("GET /jobs", async function(){ 
        test("Gets a list of jobs", async function() {
            const response = await request(app).get('/jobs');
            const jobs = response.body.jobs;
    
            expect(response.statusCode).toBe(200);
            expect(jobs).toHaveLength(1);
            expect(jobs[0]).toEqual({ 
                "company_handle": "TEST",
                "title": "test title"
            });
        });
    
        test("Gets a job by title", async function() {
            const response = await request(app).get('/jobs?search=test');
            const jobs = response.body.jobs;
    
            expect(response.statusCode).toBe(200);
            expect(jobs).toHaveLength(1);
            expect(jobs[0]).toEqual({"title": "test title", "company_handle": "TEST"});
        });
    
        test("Gets a list of jobs by minimum salary", async function() {
            const response = await request(app).get('/jobs?min_salary=50000');
            const jobs = response.body.jobs;
    
            expect(response.statusCode).toBe(200);
            expect(jobs).toHaveLength(1);
            expect(jobs[0]).toEqual({"title": "test title", "company_handle": "TEST"});
        });
    
        test("Gets an empty list when no records match query string", async function() {
            const response = await request(app).get('/jobs?min_salary=80000');
            const jobs = response.body.jobs;
    
            expect(response.statusCode).toBe(200);
            expect(jobs).toHaveLength(0);
        });
    
        test("Gets a list of jobs by maximum salary", async function() {
            const response = await request(app).get('/jobs?max_salary=50000');
            const jobs = response.body.jobs;
    
            expect(response.statusCode).toBe(200);
            expect(jobs).toHaveLength(1);
            expect(jobs[0]).toEqual({"title": "test title", "company_handle": "TEST"});
        });
    
        test("Gets an empty list when no records match query string", async function() {
            const response = await request(app).get('/jobs?max_salary=0');
            const jobs = response.body.jobs;
    
            expect(response.statusCode).toBe(200);
            expect(jobs).toHaveLength(0);
        });
    });

// GET /jobs/id
describe("GET /jobs/:id", async function(){ 
    test("Gets a job by id", async function() {
        const jobID = await db.query(`SELECT id FROM jobs WHERE title='test title'`)
        const response = await request(app).get(`/jobs/${jobID.rows[0].id}`);
        const job = response.body.job;
        console.log("JOBS: ", job);
        expect(response.statusCode).toBe(200);
        expect(job).toEqual({
            "company_handle": "TEST",
            "date_posted": expect.any(String),
            "equity": 0.5,
            "id": expect.any(Number),
            "salary": 50000,
            "title": "test title"
        });
    });
});

// PATCH /jobs/id

// DELETE /jobs/id

afterEach(async function(){
    await db.query(`DELETE FROM jobs`);
    await db.query(`DELETE FROM companies`);
});

afterAll(async function(){
    await db.end()
});

// go back to companies test make sure job info is there