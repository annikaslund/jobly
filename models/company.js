const db = require('../db');

/** Company of the site */
class Company {
    /** all() returns a list of companies
     * {handle, name} for all of the company objects
     */
    static async all() {
        const result = await db.query(
            `SELECT handle, name
                FROM companies`
        );
        return result.rows;
    }
}

module.exports = Company;
