const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const fs = require('fs');
var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Dorota84",
    database: "users"
});




app.get('/', function (req, res) {
    const pathToHtmlFile = path.resolve(__dirname, '../dist/index.html');
    const contentFromHtmlFile = fs.readFileSync(pathToHtmlFile, 'utf-8');
    res.send(contentFromHtmlFile);
});

app.use('/static', express.static(path.resolve(__dirname, '../dist')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/user-result', function (request, response) {
    const value = [request.body.name, request.body.scores, request.body.date];
    const imie = request.body.name;
    const scores = request.body.scores;
    const date = request.body.date;

    con.connect(function (err) {
        if (err) throw err;
        console.log("Connected");
        var sql = "INSERT INTO users_scores (name, scores, date) VALUES ?";
        
        con.query(sql, [[value]], function (err, result, fields) {
            if (err) throw err;
            console.log('Dodano nowy rekord');
        });
       
    });

    response.end('Twoj wynik dodano do rankingu.');
});

app.listen(3000, function () {
    console.log('Application is running on http://localhost:3000/');
})

