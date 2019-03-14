const Company = require('../models/company');
const ExpressError = require("../helpers/expressError");

async function searchHelper(searchTerms){
    let { search, min_employees, max_employees } = searchTerms;
    let baseQuery = `SELECT handle, name FROM companies`;
    let whereClause = [];
    let queryInput = [];
    let idx = 1;

    if (Object.keys(searchTerms).length === 0) {
        return [baseQuery];
    } else {
        baseQuery += ` WHERE `;
    }

    if (search) {
        whereClause.push(`(handle >= $${idx} AND handle < $${idx+1}) 
                            OR (name >= $${idx} AND name < $${idx+1})`)
        nextChar = String.fromCharCode(search.charCodeAt(0)+1);
        queryInput.push(search[0], nextChar);
        idx += 2;
    }

    if ((min_employees !== undefined) || (max_employees !== undefined)){
        min_employees = min_employees || 0;
        max_employees = max_employees || 9999;
        if ("where_clase", min_employees > max_employees){
            throw new ExpressError("min_employees must be less than max_employees", 400);
        } else {
             whereClause.push(`num_employees BETWEEN $${idx} AND $${idx+1}`);
             queryInput.push(min_employees, max_employees)
             idx += 2;
        }
    } 

    if (whereClause.length > 1){
        var joinedWhereClause = whereClause.join(` AND `);
    } else {
        var joinedWhereClause = whereClause.join(` `);
    }

    baseQuery += joinedWhereClause;
    return await [baseQuery, queryInput];
}

module.exports = searchHelper;