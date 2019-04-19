/*
* ioHook is a global mouse and keyboard listener.
* For now, we will record all events.
* The events will be pushed into a table for now.
* */

const { Pool, Client } = require('pg')
const { keyIds } = require('./utils');
const config = {
    user: 'postgres',
    host: '127.0.0.1',
    database: 'macros',
    password: 'postgres',
    port: 5432,
}

const pool = new Pool(config)

pool.query('SELECT NOW()', (err, res) => {
    console.log(err, res)
    pool.end()
})

const client = new Client(config)
client.connect()

// client.query('SELECT NOW()', (err, res) => {
//     console.log(err, res)
//     client.end()
// })

const ioHook = require('iohook');
const uuidv4 = require('uuid/v4');

const events = [
    "keydown",
    "keyup",
    "mouseclick",
    "mousedown",
    "mouseup",
    "mousemove",
    "mousedrag",
    "mousewheel"
];



// callback


// INSERT INTO events (
//     ID,
//     TIMESTAMP,
//     TYPE,
//     INFO
// ) VALUES (
//     '1df1e8e8-6f7c-4a85-9e43-1d2bbcd2c09c',
//     1528527002065,
//     'keydown',
//     '{"button":1,"clicks":1,"x":836,"y":594,"type":"mouseclick"}');

const evCreator = (type) => ioHook.on(type, info => {
    // bit of a hack because iohook doesn't emit ascii chars.
    // the keys are mapped from Linux char codes..
    // const { keycode, shiftKey } = info;
    // const keyChar = shiftKey && !(keycode >= 30 && keycode <= 44) ? keyIds[keycode] : keyIds[keycode].toLowerCase();
    const q = 'INSERT INTO events(ID, TIMESTAMP, TYPE, INFO) VALUES($1, $2, $3, $4) RETURNING *'
    const values = [
        uuidv4(),
        Date.now(),
        type,
        JSON.stringify({...info}),

    ];
    console.log('values', values);
    client.query(q, values, (err, res) => {
        if (err) {
            console.log(err.stack)
        } else {
            console.log(res.rows[0])
            // { name: 'brianc', email: 'brian.m.carlson@gmail.com' }
        }
    })
    // console.log({
    //     id: uuidv4(),
    //     timestamp: Date.now(),
    //     type,
    //     info: JSON.stringify(info),
    // });
});

events.forEach(evType => evCreator(evType));

// Register and start hook
ioHook.start();

// Alternatively, pass true to start in DEBUG mode.
// ioHook.start(true);
