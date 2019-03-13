const Company = require('../models/company');

function searchHelper(searchTerm){
    if (searchTerm === undefined){
        return Company.all();
    } else {
        return Company.search(searchTerm);
    }
}

module.exports = searchHelper;