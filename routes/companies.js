const express = require("express");
const router = new express.Router();
const Company = require("../models/Company");
const ExpressError = require("../helpers/expressError");
const searchHelper = require("../helpers/companySearch");
const jsonschema = require("jsonschema");
const companySchema = require("../schemas/companySchema.json");

/** GET a list of filtered companies with {handle, name} */
router.get('/', async function(req, res, next){
    try{
        //get search term if there is any
        let sqlQuery = await searchHelper(req.query);
        let companies = await Company.search(sqlQuery)
        return res.json({ companies })   
    } catch (err) {
        return next(err);
    }
})

/** POST will create a new company and return the newly created company */
router.post('/', async function(req, res, next){
    try {
        const result = jsonschema.validate(req.body, companySchema);

        if (!result.valid) {
            //pass validation errors to error handler
            let listOfErrors = result.errors.map(error => error.stack);
            let error = new ExpressError(listOfErrors, 400);
            return next(error)
        }
        
        let company = await Company.create(req.body);
        return res.json({ company });
    } catch (err) {
        return next(err);
    }
})

/** Get a single company found by its id (handle) returning the company data */
router.get('/:handle', async function(req, res, next){
    try {
        const company = await Company.findOne(req.params.handle);
        return res.json({ company })
    } catch (err) {
        return next(err);
    }
})





module.exports = router;