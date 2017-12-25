const https = require('https');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const csvUrl = 'https://prod-edxapp.edx-cdn.org/assets/courseware/v1/07d100219da1a726dad5eddb090fa215/asset-v1:Microsoft+DEV283x+2T2017+type@asset+block/customer-data.csv';
const csvName = 'customer-data.csv';
const jsonName = 'customer-data.json';

function download(url, fileName = csvName, deleteExisting = true, callback = null) {
    const output = path.join(__dirname, fileName);
    if (deleteExisting && fs.existsSync(output)) {
        fs.unlinkSync(output);
    }

    if (!fs.existsSync(output)) {
        console.log(`Download for ${fileName} started`);
        https.get(url, res => {
            res.on('data', data => fs.appendFileSync(output, data));
            res.on('end', () => {
                console.log(`Download for ${fileName} ended`);
                callback();
            });
        }).on('error', err => console.error(`Error while using https.get: ${err}`));
    } else {
        console.log(`File ${fileName} already exists`);
        callback();
    }

}

function csvToJson(fromFileName, toFileName) {
    console.log(`Converting from ${fromFileName} to ${toFileName} started`);
    let results = [];
    let lineNumber = 0;
    let header;

    let reader = readline.createInterface({
        input: fs.createReadStream(path.join(__dirname, fromFileName)),
    });

    reader.on('line', line => {
        if (lineNumber === 0) {
            header = line.split(',');
        } else {
            results.push(lineToJson(header, line));
        }

        lineNumber++;
    });

    reader.on('close', () => {
        fs.writeFileSync(path.join(__dirname, toFileName), JSON.stringify(results, null, 2));
        console.log(`Converting from ${fromFileName} to ${toFileName} ended`);
    })
}

function lineToJson(names, line) {
    const splitLine = line.split(',');
    let result = {};

    names.forEach((name, index) => {
        result[name] = splitLine[index];
    });

    return result;
}

function downloadAndConvert(url, fromFileName, toFileName) {
    download(url, fromFileName, false, () => csvToJson(fromFileName, toFileName));
}

downloadAndConvert(csvUrl, csvName, jsonName);
