// Import required modules and assign
// to variables. 
var express = require('express');
var pg = require('pg');
var bodyParser = require ('body-parser');

var app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
	extended: true
}));

// Configure app database and set up
// connection, query functions.
var db = {};

db.config = {
	database: 'lab',
	port: 5432,
	host: 'localhost'
};

db.connect = function(runAfterConnecting) {
    pg.connect(db.config, function(err, client, done){
        if (err) {
            console.error("Something went wrong.", err);
        }
        runAfterConnecting(client);
        done();
    });
};

db.query = function(statement, params, callback){
    db.connect(function(client){
        client.query(statement, params, callback);
    });
};

// Query managers for display on '/'.
app.get("/", function(req, res) {
	db.query("SELECT * FROM managers;", function(error, result) {
		res.render("index.ejs", {
			allManagers: result.rows
		});
	});
});

// Insert new manager into database from '/'.
app.post('/', function(req, res) {
	db.query("INSERT INTO managers (first_name, last_name, property) VALUES ($1, $2, $3);", [req.body.first_name, req.body.last_name, req.body.property], function(error, result) {
		res.redirect('/');
	});
});

// Query tenants for display on '/tenants'.
app.get("/tenants", function(req, res) {
	db.query("SELECT * FROM tenants;", function(error, result) {
		res.render("tenants.ejs", {
			allTenants: result.rows
		});
	});
});

// Insert new tenants into database from '/tenants'.
app.post('/tenants', function(req, res) {
	db.query("INSERT INTO tenants (first, last, address) VALUES ($1, $2, $3);", [req.body.first, req.body.last, req.body.address], function(error, result) {
		res.redirect('/tenants');
	});
});

// Query tenants for each chosen manager,
// display on tenants.ejs.
app.get("/managers/:id", function(req, res) {
	db.query("SELECT first, last, address FROM tenants JOIN managers ON (address = property) WHERE managers.id = $1;", [req.params.id], function(error, result) {
		res.render("tenants.ejs", {
			allTenants: result.rows
		});
	});
});

// Query manager for list of properties,
// and create an array for use in drop
// down menu on tenants.ejs
var properties = [];
app.get("/managers/", function(req, res) {
	db.query("SELECT property FROM managers;", function(error, result) {
		properties = result.rows
	});
});

app.listen(3000);