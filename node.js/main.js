const Influx = require('influx');

// init database
const influx = new Influx.InfluxDB('http://localhost:8086'); 
// depends on your permission you can also use "const influx = new Influx.InfluxDB('http://admin:admin@localhost:8086');"

setInterval(writeData, 1000); // call function every 1000 miliseconds

function writeData() {
    var randData1 = (Math.random() * 101);
    var randData2 = (Math.random() * 41 - 20);
    var randData3 = (Math.random() * 501);
    var randData4 = randIn1 * randIn2;

    var randStat = Math.floor(Math.random() * 3);

    var stat = "";

   // random string data
    switch (randStat) {
        case 0:
            stat = "Ok";
            break;
        case 1:
            stat = "Not Ok"
            break;
        default:
            stat = "Maybe?";
    }

    // write points to database
    influx.writePoints([
        {
            measurement: 'data',
            tags: { motor: 'm1' },
            fields: { value: randData1 },
        },
        {
            measurement: 'data',
            tags: { motor: 'm2' },
            fields: { value: randData2,
                      status: stat
            }
        },
        {
            measurement: 'data',
            tags: { motor: 'm3' },
            fields: {
                value: randData3,
                status: stat
            }
        },
        {
            measurement: 'data',
            tags: { motor: 'm4' },
            fields: {
                value: randData4,
                status: stat
            }
        }
    ], {
            database: 'db_test'
        })
        .catch(error => {
            console.error(`Error saving data to InfluxDB! ${error.stack}`)
        });
}
