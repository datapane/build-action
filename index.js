const core = require("@actions/core");
const { exec } = require("@actions/exec");
const path = require("path");
const os = require("os");

async function run() {
     try {
        const scriptPath = core.getInput("script_path");
        const token = core.getInput("token");
        const requirements = JSON.parse(core.getInput("requirements"));
        const params = core.getInput("parameters");
        const server = core.getInput("server");
        const fullScriptPath = path.join(__dirname, "..", scriptPath);

        !requirements.includes("datapane") && requirements.push("datapane");

        for (const requirement of requirements) {
            core.info(`installing ${requirement}`);
            await exec(`pip install ${requirement}`);
        }

        if (token) {
            core.info(`Logging in to ${server}`);
            await exec(`datapane login --token=${token} --server=${server}`);
        }

        core.info(`Executing ${fullScriptPath}`);
        await exec(`python ${fullScriptPath}`);

    } catch (error) {
        core.setFailed(error.message);
    }
}

run();