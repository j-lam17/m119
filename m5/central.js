// based on the example on https://www.npmjs.com/package/@abandonware/noble

const noble = require('@abandonware/noble');

const uuid_service = "1101"
const uuid_value = "2103"

let sensorValue1 = NaN
let sensorValue2 = NaN

let devices = 0

noble.on('stateChange', async (state) => {
    if (state === 'poweredOn') {
        console.log("start scanning")
        await noble.startScanningAsync([uuid_service], false);
    }
});

noble.on('discover', async (peripheral) => {
    // Only stop scanning after 2 devices have been found
    if (devices == 2) {
        await noble.stopScanningAsync();
        return;
    }
    await peripheral.connectAsync();
    const {
        characteristics
    } = await peripheral.discoverSomeServicesAndCharacteristicsAsync([uuid_service], [uuid_value]);
    if (devices == 0) {
        readData(characteristics[0])
    } else {
        readData2(characteristics[0])
    }
    devices++;
});

//
// read data periodically
//
let readData = async (characteristic) => {
    const value = (await characteristic.readAsync());
    sensorValue1 = value.readFloatLE(0);
    console.log("IMU1: " + sensorValue1);

    // read data again in t milliseconds
    setTimeout(() => {
        readData(characteristic)
    }, 50);
}

let readData2 = async (characteristic) => {
    const value = (await characteristic.readAsync());
    sensorValue2 = value.readFloatLE(0);
    console.log("IMU2: " + sensorValue2);

    // read data again in t milliseconds
    setTimeout(() => {
        readData(characteristic)
    }, 50);
}

//
// hosting a web-based front-end and respond requests with sensor data
// based on example code on https://expressjs.com/
//
const express = require('express')
const app = express()
const port = 3000

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index')
})

app.post('/', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'application/json'
    });
    res.end(JSON.stringify({
        sensorValue1: sensorValue1,
        sensorValue2: sensorValue2
    }))
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

app.use(express.static('/Users/jlam/Documents/CodeProjects/M119/m3/'))