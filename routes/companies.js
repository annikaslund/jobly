const express = require("express");
const router = new express.Router();
const Company = require("../models/Company");
const ExpressError = require("../helpers/expressError");
const searchHelper = require("../helpers/companySearch");

/** GET a list of filtered companies with {handle, name} */
router.get('/', async function(req, res, next){
    try{
        //get search term if there is any

        let companies = await searchHelper(req.query);
        return res.json({ companies })   
    } catch (err) {
        return next(err);
    }
})







module.exports = router;