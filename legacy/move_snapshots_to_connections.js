const path = require("path");
const utilsInitializer = require(path.join(__dirname, "..", "utils", "initializeUtils.js"));

let snapshot = utilsInitializer.matchesSnapshotUtils().getLastSnapshot();
let graph = new Map();
let matched = new Map();
if (snapshot !== undefined) {
    let parsed_snapshot = JSON.parse(snapshot);
    let array_graph = JSON.parse(parsed_snapshot.raw_graph);
    let array_matched = JSON.parse(parsed_snapshot.raw_matched);
    for (let i=0; i<array_graph.length; i++) {
        graph.set(array_graph[i][0], new Map(array_graph[i][1]));
    }

    for (let i=0; i<array_matched.length; i++) {
        matched.set(array_matched[i][0], new Set(array_matched[i][1]));
    }
}

utilsInitializer.userConnectionsUtils().dump(graph, matched);
