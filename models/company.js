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

    /**search() returns a filtered list of companies
     * {handle, name} for search term that is handle or name
     */
    static async search(searchTerm) {
        const result = await db.query(
            `SELECT handle, name
                FROM companies 
                WHERE handle ILIKE $1 OR name ILIKE $1`,
                [`%${searchTerm}%`]
        );
        return result.rows;
    }
}

module.exports = Company;
