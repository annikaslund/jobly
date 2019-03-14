const db = require('../db');
const ExpressError = require('../helpers/expressError');

/** Company of the site */
class Company {

    /**search() returns a filtered list of companies
     * {handle, name} for search term that is handle or name
     */
    static async search(sqlArray) {
        //passed from helper/companySearch [query, [values]]
        const result = await db.query(sqlArray[0], sqlArray[1]);
        
        return result.rows;
    }

    /** create creates a new company and inserts into database.
     * it will return the new company data as:
       {handle, name, num_employees, description, logo_url}    */
    static async create(companyObj){
        const { handle, name, num_employees, description, logo_url } = companyObj;

        const result = await db.query(`
            INSERT INTO companies (handle, name, num_employees, description, logo_url)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING handle, name, num_employees, description, logo_url`,
            [handle, name, num_employees, description, logo_url]);
        
        return result.rows[0];
    }

    /** return a company's data given handle 
     * it will return the existing company data as:
       {handle, name, num_employees, description, logo_url} 
     */
    static async findOne(handle){
        const result = await db.query(
            `SELECT handle, name, num_employees, description, logo_url
                FROM companies
                WHERE handle=$1`,
                [handle]
        );
        if (result.rows.length === 0){
            throw new ExpressError('Invalid handle', 404);
        }
        return result.rows[0];
    }
}

module.exports = Company;
