const express = require("express");
const router = new express.Router();
const Company = require("../models/Company");
const ExpressError = require("../helpers/expressError");
const searchHelper = require("../helpers/companySearch");

/** GET a list of filtered companies with {handle, name} */
router.get('/', async function(req, res, next){
    try{
        //get search term if there is any
        let searchTerm = req.query;
        
        // get all companies (when no search term is passed, req.query = {})
        if (searchTerm.hasOwnProperty("search") ) {
            const companies = await Company.search(searchTerm.search);
            return res.json({ companies });
        } else if (searchTerm.hasOwnProperty("min_employees")){
            const companies = await Company.min_employees(searchTerm.min_employees);
            return res.json({ companies });
        } else if (searchTerm.hasOwnProperty("max_employees")) {
            const companies = await Company.max_employees(searchTerm.max_employees);
            return res.json({ companies });
        } else {
            const companies = await Company.all();
            return res.json({ companies });
        }
        
    } catch (err) {
        return next(err);
    }
})







module.exports = router;