process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../../app");
const db = require("../../db");

beforeEach(async function () {
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

describe("POST /jobs", async function () {
    test("Create a job and return the new job data", async function () {
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
describe("GET /jobs", async function () {
    test("Gets a list of jobs", async function () {
        const response = await request(app).get('/jobs');
        const jobs = response.body.jobs;

        expect(response.statusCode).toBe(200);
        expect(jobs).toHaveLength(1);
        expect(jobs[0]).toEqual({
            "company_handle": "TEST",
            "title": "test title"
        });
    });

    test("Gets a job by title", async function () {
        const response = await request(app).get('/jobs?search=test');
        const jobs = response.body.jobs;

        expect(response.statusCode).toBe(200);
        expect(jobs).toHaveLength(1);
        expect(jobs[0]).toEqual({ "title": "test title", "company_handle": "TEST" });
    });

    test("Gets a list of jobs by minimum salary", async function () {
        const response = await request(app).get('/jobs?min_salary=50000');
        const jobs = response.body.jobs;

        expect(response.statusCode).toBe(200);
        expect(jobs).toHaveLength(1);
        expect(jobs[0]).toEqual({ "title": "test title", "company_handle": "TEST" });
    });

    test("Gets an empty list when no records match query string", async function () {
        const response = await request(app).get('/jobs?min_salary=80000');
        const jobs = response.body.jobs;

        expect(response.statusCode).toBe(200);
        expect(jobs).toHaveLength(0);
    });

    test("Gets a list of jobs by maximum salary", async function () {
        const response = await request(app).get('/jobs?max_salary=50000');
        const jobs = response.body.jobs;

        expect(response.statusCode).toBe(200);
        expect(jobs).toHaveLength(1);
        expect(jobs[0]).toEqual({ "title": "test title", "company_handle": "TEST" });
    });

    test("Gets an empty list when no records match query string", async function () {
        const response = await request(app).get('/jobs?max_salary=0');
        const jobs = response.body.jobs;

        expect(response.statusCode).toBe(200);
        expect(jobs).toHaveLength(0);
    });
});

// GET /jobs/id
describe("GET /jobs/:id", async function () {
    test("Gets a job by id", async function () {
        const jobID = await db.query(`SELECT id FROM jobs WHERE title='test title'`)
        const response = await request(app).get(`/jobs/${jobID.rows[0].id}`);
        const job = response.body.job;

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
describe("PATCH /jobs/:id", async function () {
    test("Update a job and return the updated job data", async function () {
        const jobID = await db.query(`SELECT id FROM jobs WHERE title='test title'`)
        const response = await request(app)
            .patch(`/jobs/${jobID.rows[0].id}`)
            .send({
                title: "bananaTest",
                salary: 11
            });
        const job = response.body.job;

        expect(response.statusCode).toBe(200);
        expect(job).toEqual({
            "company_handle": "TEST",
            "date_posted": expect.any(String),
            "equity": 0.5,
            "id": expect.any(Number),
            "salary": 11,
            "title": "bananaTest"
        });
    });

        test("Update a job with invalid data and return error message", async function () {
            const response = await request(app)
                .patch('/jobs/199999')
                .send({
                    title: "lolz joelie",
                    salary: 101
                });
            const message = response.body.message;

            expect(response.statusCode).toBe(404);
            expect(message).toEqual('invalid id');
        });

});

// DELETE /jobs/id
describe("DELETE /jobs/:id", async function(){ 
    test("Delete a job returns a friendly message if sucessful.", async function() {
        const jobID = await db.query(`SELECT id FROM jobs WHERE title='test title'`)
        const response = await request(app)
        .delete(`/jobs/${jobID.rows[0].id}`);
        const message = response.body.message;
        
        expect(response.statusCode).toBe(200);
        expect(message).toEqual('Job deleted');
    });

    test("Deleting a job that doesn't exist will return an error message.", async function() {
        const response = await request(app)
        .delete('/jobs/1');
        const message = response.body.message;
        
        expect(response.statusCode).toBe(404);
        expect(message).toEqual('Invalid id');
    });
});

afterEach(async function () {
    await db.query(`DELETE FROM jobs`);
    await db.query(`DELETE FROM companies`);
});

afterAll(async function () {
    await db.end()
});

// go back to companies test make sure job info is there