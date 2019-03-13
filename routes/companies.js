const express = require("express");
const router = new express.Router();
const Company = require("../models/Company");
const ExpressError = require("../expressError");

/** GET a list of companies with {handle, name} */
router.get('/', async function(req, res, next){
    try{
        const companies = await Company.all();
        return res.json({ companies });
    } catch (err) {
        return next(err);
    }
})



module.exports = router;