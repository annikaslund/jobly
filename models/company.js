const db = require('../db');

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
}

module.exports = Company;
