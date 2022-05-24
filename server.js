const express = require("express");
const path = require("path")
const app = express();
const fs = require('fs');
const util = require('util');
const { v4: uuidv4 } = require('uuid');

const PORT = process.env.PORT || 3001

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

const readFromFile = util.promisify(fs.readFile);

const writeToFile = (destination, content) => {
    fs.writeFile(destination, JSON.stringify(content, null, 4), (err) => {
        err ? console.error(err) : console.info(`\nData written to ${destination}`)
    });
};

const readAndAppend = (content, file) => {
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
        } else {
            const parsedData = JSON.parse(data);
            parsedData.push(content);
            writeToFile(file, parsedData);
        }
    });
};

app.get('/api/notes', (req, res) => {
    console.info(`${req.method} request has been received for notes`);
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
});

app.post('/api/notes', (req, res) => {
    console.info(`${req.method} request received to add a note`);
    const { title, text } = req.body

    if (req.body) {
        const newNote = {
            title,
            text,
            id: uuidv4()
        };

        readAndAppend(newNote, './db/db.json');
        res.json(`Note added successfully!`);
    } else {
        res.error('Error in adding note!');
    }
});

app.delete("/api/notes/:id", function(req, res) {
    readFromFile('./db/db.json').then((data) => {
        const notes = JSON.parse(data)
        const newNotes = notes.filter((note) => {
            return note.id !== req.params.id

        })
        writeToFile('./db/db.json', newNotes) 
        res.json(newNotes)
        console.log("Deleted note with id "+req.params.id);
    })
});

app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, './public/notes.html'))
);

app.get('/', (req, res) =>
    res.sendFile(path.join(__dirname, './public/index.html'))
);

app.listen(PORT, () => {
    console.log(`App listening at http://localhost:${PORT}`)
})


