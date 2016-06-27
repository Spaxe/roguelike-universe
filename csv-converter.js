// Simple NodeJS commandline script to convert JSON to CSV.
// Usage:
//    node csv-converter.js input_path.json > output_path.csv
//
// Dependency: json-2-csv

if (process.argv.length < 3) process.exit(1);

var fs = require('fs');
var json_2_csv = require('json-2-csv');

fs.readFile(process.argv[2], {encoding: 'utf-8'}, function (err, data) {
  if (err) throw err;

  json_2_csv.json2csv(JSON.parse(data), function (err, csv) {
    if (err) throw err;

    console.log(csv);
  }, {
    checkSchemaDifferences: false,
    emptyFieldValue: ''
  });

});
