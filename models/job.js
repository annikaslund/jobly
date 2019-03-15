const db = require('../db');
const ExpressError = require('../helpers/expressError');
const sqlForPartialUpdate = require('../helpers/partialUpdate');

/** Job of the site */
class Job {

    static safeData(){
        let validCols = ['title', 'salary', 'equity', 'company_handle', 'date_posted']
        return validCols;
    }

    /** create() add a new job to the db
     * if all datafields are valid
     */
    static async create(data){
        const result = await db.query(`
            INSERT INTO jobs (title, salary, equity, company_handle, date_posted)
            VALUES ($1, $2, $3, $4, current_timestamp)
            RETURNING id, title, salary, equity, company_handle, date_posted`,
            [data.title, data.salary, data.equity, data.company_handle]
        )
        return result.rows[0]
    }

    /** search() returns a list of jobs
     * it will return all jobs in db if nothing was searched as -
     *      jobs: [{title, company_handle}, {title, company_handle}, ...]
     * it will return a filtered list of jobs if there is any query passed
     */
    static async search(urlData) {
        const alphabet = 'abcdefghijklmnopqrstuvwxyz{';
        let { search, min_salary, max_salary } = urlData;
        let sql =  `SELECT title, company_handle 
                    FROM jobs`;
        let searchCriteria = [];
        let $values = []
        let idx = 1;
        
        if (search) {
            search = search.toLowerCase();
            searchCriteria.push(`title>=$${idx} AND title<$${idx+1}`);
            // add the fist letter of the search term and the next letter in the alphabet.
            $values.push(search[0], alphabet[alphabet.indexOf(search[0])+1]);
            idx += 2;
        }

        if (min_salary && max_salary && (min_salary > max_salary)){
            // should return object with error, not new express instance
            throw new ExpressError("min_salary must be less than max_salary", 400);
        }

        if (min_salary) {
            searchCriteria.push(`salary>=$${idx}`);
            $values.push(min_salary);
            idx += 1;
        }

        if (max_salary) {
            searchCriteria.push(`salary<=$${idx}`);
            $values.push(max_salary);
            idx += 1;
        }

        if (searchCriteria.length !== 0){
            sql += ` WHERE `;
            sql += searchCriteria.join(` AND `);
            let jobs = await db.query(sql, $values);
            return jobs.rows;
        } else {
            let jobs = await db.query(sql);
            return jobs.rows ;
        }
    }

    /** findOne() returns a single job from the database as 
     * job: {id, title, salary, equity, company_handle, date_posted}
    */
    static async findOne(id){
        let result = await db.query(`
            SELECT id, title, salary, equity, company_handle, date_posted
            FROM jobs
            WHERE id=$1`,
            [id]
        );

        if (result.rows.length === 0){
            throw { message: 'Invalid id', status: 404 };
        }

        return result.rows[0];
    }

    /** update() updates specified job and returns the updated job as 
    * job: {id, title, salary, equity, company_handle, date_posted}
    */
   static async update(data, id){
    const { query, values } = sqlForPartialUpdate('jobs', data, 'id', id, Job.safeData());
        let result = await db.query(query, values);
        if (result.rows.length === 0){
            throw {message: "invalid handle", status: 404};
        }
        return result.rows[0];
    }

    /**DELETE job from database given id
     * returning message of "job deleted" if id is correct
     */
    static async delete(id) {
        const result = await db.query(
            `DELETE FROM jobs
                WHERE id=$1
                RETURNING id`,
                [id]
        );
        
        if (result.rows.length === 0) {
            throw { message: "Invalid id", status: 404};
        }
        return 'Job deleted'
    }
}

module.exports = Job;