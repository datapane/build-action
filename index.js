const core = require("node_modules/@actions/core");
// const github = require("@actions/github");
// const exec = require("@actions/exec");

try {
    const scriptPath = core.getInput("path");
    const token = core.getInput("token");
    const requirements = core.getInput("requirements");
    const params = core.getInput("parameters");
    core.setOutput("summary",  token);
} catch (error) {
    core.setFailed(error.message);
}