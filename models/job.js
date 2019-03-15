const db = require('../db');
const ExpressError = require('../helpers/expressError');

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
        let sql =  `SELECT title, company_handle 
                    FROM jobs`;
        let searchCriterias = [];
        let $values = []
        const alphabet = 'abcdefghijklmnopqrstuvwxyz{';
        let idx = 1;
        if (search) {
            search = search.toLowerCase();
            searchCriterias.push(`title>=$${idx} AND title<$${idx+1}`);
            $values.push(search[0], alphabet[alphabet.indexOf[search[0]]+1]);
            idx += 2;
        }
        if (min_salary && max_salay && min_salary > max_salay){
            throw new ExpressError("min_salary must be less than max_salary", 400);
        }
        if (min_salary) {
            searchCriterias.push(`salary>=$${idx}`);
            $values.push(min_salary);
            idx += 1;
        }
        if (max_salay) {
            searchCriterias.push(`salary<=$${idx}`);
            $values.push(max_salay);
            idx += 1;
        }

        if (searchCriterias.length !== 0){
            sql += ` WHERE `;
            sql += searchCriterias.join(` AND `);
            let companies = await db.query(sql, $values);
            return { companies };
        }
        else {
            let companies = await db.query(sql);
            return { companies} ;
        }
    }
}