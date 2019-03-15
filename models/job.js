const db = require('../db');

/** Job of the site */
class Job {

    /** create() add a new job to the db
     * if all datafields are valid
     */
    static async create(data){
        const result = await db.query(`
            INSERT INTO jobs (title, salary, equity, company_handle, date_posted)
            VALUES ($1, $2, $3, $4)
            RETURNING id title, salary, equity, company_handle, date_posted`,
            [data.title, data.salary, data.equity, data.company_handle]
        )
        return result.rows[0]
    }

    /** search() returns a list of jobs
     * it will return all jobs in db if nothing was searched
     * it will return a filtered list of jobs if there is any query passed
     */
    static async search(urlData) {
        let { search, min_salary, max_salay } = urlData;
        let sql =  `SELECT id, title, salary, equity, company_handle, date_posted
                    FROM jobs`;
        let searchCriterias = [];

        if (search) {
            const 
        }
        if (min_salary || max_salay) {

        }
    }
}