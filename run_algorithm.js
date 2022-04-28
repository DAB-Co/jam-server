const path = require("path");
const algorithm = require(path.join(__dirname, "utils", "algorithmEntryPoint.js"));

algorithm.run().then();
