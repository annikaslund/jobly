const express = require("express");
const router = new express.Router();
const Job = require("../models/Job");
const jsonschema = require("jsonschema");
const jobSchema = require("../schemas/jobSchema.json");

/** GET /jobs returns a list of filtered jobs as 
 * jobs: [{handle, name}, {handle, name}, ...] */
router.get('/', async function(req, res, next){
    try{
        //get search term if there is any
        let searchData = req.query;
        let jobs = await Job.search(searchData);
        return res.json({ jobs })   
    } catch (err) {
        return next(err);
    }
})

/** POST /jobs creates a new job and returns the new job data as 
 * job: {title, salary, equity, company_handle, date_posted}*/
router.post('/', async function(req, res, next){
    try{
        //add job with jsonschema validation
        const result = jsonschema.validate(req.body, jobSchema);

        if (!result.valid) {
            //pass validation errors to error handler
            let listOfErrors = result.errors.map(error => error.stack);
            let error = new ExpressError(listOfErrors, 400);
            return next(error)
        }

        let job = await Job.create(req.body);
        return res.json({ job })   
    } catch (err) {
        return next(err);
    }
})

module.exports = router;