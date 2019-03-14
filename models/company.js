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


}

module.exports = Company;
