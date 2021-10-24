const express = require("express"); // framework for nodejs
const path = require("path"); // useful for joining file paths

const argv = require("yargs")(process.argv.slice(2))
	.option("port", {
		description: "port to bind",
		type: "number",
		demandOption: true,
	})
	.help().alias("help", "h")
	.parse();

const app = express(); // create express app

// parse data, useful for post or put requests
app.use(express.urlencoded({
    extended: false
}));

// Start listening to given port
const server = app.listen(argv.port, () => {
    console.log(`Running on port ${server.address().port}`);
});

// Let routes folder handle every get and post request
const routes = require(path.join(__dirname, "routes", "index")); // look at index.js file in routes folder
app.get("*", routes);
app.post("*", routes);

app.use(function (err, req, res, next) {
    console.log(err);
    res.status(500);
    res.send("unexpected error");
});
