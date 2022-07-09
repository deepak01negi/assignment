const createConnection = require('../server');
const tables = require('./constants/tableNames');


const formatTime = (time) => {
    const timeArr = time.replace("am", "").replace("pm", "").split(":");
    const timeHour = parseInt(timeArr[0]);
    const timeMin = parseInt(timeArr[1]);
    return [timeHour, timeMin];
}

const checkTimeFormat = (time) => {
    if (time.includes("am")) {
        return time;
    }
    const timeArr = formatTime(time);
    if (timeArr[0] === 12) {
        timeArr[0] = 0;
    }
    if (timeArr[0] < 12) {
        timeArr[0] = timeArr[0] + 12;
    }
    return `${timeArr[0]}:${timeArr[1]} pm`;
}

const getTimeInMins = (time) => {
    return (parseInt(time[0]) * 60) + (parseInt(time[1]));
}

const calculateTimeDiff = (startTime, endTime) => {
    const startArr = formatTime(startTime);
    const startTimeInMins = getTimeInMins(startArr);

    const endArr = formatTime(endTime);
    const endTimeInMins = getTimeInMins(endArr);

    return parseInt(endTimeInMins - startTimeInMins);
}

const convertToDoubleDigit = (digit) => {
    return `0${digit}`.slice(-2);
}

const getIntervals = (startTime, endTime, noOfIntervals) => {
    const startArr = formatTime(startTime);
    const endArr = formatTime(endTime);
    let rangeStartHr = startArr[0];
    let rangeStartMin = startArr[1];

    let timeSuffix = "am";
    const timeIntervals = [[`${convertToDoubleDigit(rangeStartHr)}:${convertToDoubleDigit(rangeStartMin)} ${timeSuffix}`,]];

    for (let i = 0; i < noOfIntervals; i++) {
        rangeStartMin += 24;
        if (rangeStartMin >= 60) {
            rangeStartHr += 1;
            rangeStartMin -= 60;
        }
        if (rangeStartHr >= 12) {
            timeSuffix = "pm";
        }
        timeIntervals[i].push(`${convertToDoubleDigit(rangeStartHr)}:${convertToDoubleDigit(rangeStartMin)} ${timeSuffix}`);
        if (i < noOfIntervals - 1) {
            timeIntervals.push([`${convertToDoubleDigit(rangeStartHr)}:${convertToDoubleDigit(rangeStartMin)} ${timeSuffix}`]);
        }

    }
    return timeIntervals;
}


async function addData(addInfo) {
    const connection = await createConnection();
    await connection.beginTransaction();
    try {

        addInfo.start_time = checkTimeFormat(addInfo.start_time);
        addInfo.end_time = checkTimeFormat(addInfo.end_time);

        const timeDifference = calculateTimeDiff(addInfo.start_time, addInfo.end_time);

        if (timeDifference < 0) {
            connection.rollback();
            return { success: false, err: "Time period is not wrong." };
        }

        const subsituteArr = [addInfo.doctor_id, addInfo.start_time, addInfo.end_time, addInfo.no_of_patients];
        const qry = `insert into ${tables.DOCTORAVAILABLITIESSLOTS} (doctor_id,start_time,end_time,no_of_patients) values(?,?,?,?) ;`
        const [docRows, fields] = await connection.execute(qry, subsituteArr);

        console.log(docRows, ":LLL ", JSON.parse(JSON.stringify(docRows)));

        const noOfIntervals = Math.ceil(timeDifference / 24);
        const timeIntervals = getIntervals(addInfo.start_time, addInfo.end_time, noOfIntervals);

        for (let i = 0; i < timeIntervals.length; i++) {
            const subsituteArr = [addInfo.doctor_id, docRows.insertId, timeIntervals[i][0], timeIntervals[i][1]];
            const qry = `insert into ${tables.DOCTORTIMESLOTS} (doctor_id,doctor_availability_id,slot_start_time,slot_end_time) values(?,?,?,?) ;`;
            const [rows, fields] = await connection.execute(qry, subsituteArr);
        }

        await connection.commit();
        return { success: true, result: "Entries got inserted successfully" };
    }
    catch (err) {
        console.error(`Error occurred while creating doctor info: ${err.message}`, err);
        connection.rollback();
        throw 'error creating doctor info';
    }
}

async function retriveData(getInfo) {
    try {
        const connection = await createConnection();

        const qry = `select doc.* from doctor_time_slots doc
        inner join patient_booking_slots pat on pat.doctor_time_slot_id = doc.id
        inner join doctor_availabilities aval on aval.doctor_id = doc.doctor_id
        where pat.appointment_date = ? and pat.doctor_time_slot_id = ?;`;

        const [rows, fields] = await connection.execute(qry, [getInfo.appointment_date, getInfo.doctor_time_slot_id]);
        return rows;

    }
    catch (err) {
        console.error(`Error occurred while while getting slots: ${err.message}`, err);
        throw 'error while getting slots';
    }
}

module.exports = { addData, retriveData };