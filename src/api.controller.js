const express = require('express');
const router = express.Router();
const apiService = require('./api.service');

router.get('/getData', getApiData);
router.post('/addData', addData);
router.post('/retriveData', retriveData);


module.exports = router;
//use ASYNC AWAIT HERE AS WELL


function getApiData(req, res) {
    try {
        apiService.getData()
            .then(result => {
                console.log('API RESULT', result);
                return res.json({ success: true, result });
            })
            .catch(err => {
                console.error(err);
                return res.json({ success: false, err });
            });
    }
    catch (e) {
        console.error(e, "ERROR IN GETTING TEST DATA");
        return res.json({ success: false, err: e });
    }
}

function addData(req, res) {
    try {
        const { doctor_id, start_time, end_time, no_of_patients } = req.query;
        const addInfo = { doctor_id, start_time, end_time, no_of_patients };
        apiService.addData(addInfo)
            .then(result => {
                console.log('ADD RESULT', result);
                return res.json(result);
            })
            .catch(err => {
                console.error(err);
                return res.json({ success: false, err });
            });
    }
    catch (e) {
        console.error(e, "ERROR IN CREATING DATA");
        return res.json({ success: false, err: e });
    }
}

function retriveData(req, res) {
    try {
        const { appointment_date, doctor_id, doctor_time_slot_id, no_of_patients } = req.query;
        const getInfo = { appointment_date, doctor_id, doctor_time_slot_id, no_of_patients };
        apiService.retriveData(getInfo)
            .then(result => {
                console.log('API RESULT', result);
                return res.json({ success: true, result });
            })
            .catch(err => {
                console.error(err);
                return res.json({ success: false, err });
            });
    }
    catch (e) {
        console.error(e, "ERROR IN RETRIEVING DATA");
        return res.json({ success: false, err: e });
    }
}