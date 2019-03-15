const express = require("express");
const router = new express.Router();
const Job = require("../models/Job");

/** GET a list of filtered jobs with {handle, name} */
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

/** POST a job and return the new job data */
router.post('/', async function(req, res, next){
    try{
        let jobData = req.body.job;
        //add job with jsonschema validation
        let job = await Job.create(jobData);
        return res.json({ jobs })   
    } catch (err) {
        return next(err);
    }
})

module.exports = router;