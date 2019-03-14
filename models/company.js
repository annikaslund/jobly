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
            throw { message: 'Invalid handle', status: 404 };
        }
        return result.rows[0];
    }

    /** given a handle and new company information, will update an existing
     * company's information. returns updated company data as:
     * {handle, name, num_employees, description, logo_url} 
     */
    static async update(updatingInfo){
        //consider use sqlForPartialUpdate(companies, updatingInfo, key, id)

        let query = `UPDATE companies SET `
        let setClause = [];
        let setValues = []
        let idx = 1;

        for (let key in updatingInfo){
            if (updatingInfo[key] === updatingInfo.handle){
                continue;
            }
            setClause.push(`${key}=($${idx})`);
            setValues.push(updatingInfo[key]);
            idx += 1;
        }

        setClause = setClause.join(', ');
        query += setClause;
        query += ` WHERE handle=$${idx} RETURNING handle, name, num_employees, description, logo_url`;
        setValues.push(updatingInfo.handle);

        let result = await db.query(query, setValues);
        if (result.rows.length === 0){
            throw {message: "invalid handle", status: 404};
        }
        return result.rows[0];
    }

    /**DELETE company from database given handle
     * returning message of successfully deleted if handle is correct
     */
    static async delete(handle) {
        const result = await db.query(
            `DELETE FROM companies
                WHERE handle=$1
                RETURNING handle`,
                [handle]
        );
        
        if (result.rows.length === 0) {
            throw { message: "Invalid handle", status: 404};
        }
        return 'Company deleted'
    }
}

module.exports = Company;
