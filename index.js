const core = require("@actions/core");
const { exec } = require("@actions/exec");
const path = require("path");

async function run() {
     try {
        const scriptPath = core.getInput("script_path");
        const token = core.getInput("token");
        const requirements = JSON.parse(core.getInput("requirements"));
        const params = JSON.parse(core.getInput("parameters"));
        const server = core.getInput("server");
        const fullScriptPath = path.join(process.env.GITHUB_WORKSPACE, scriptPath);

        !requirements.includes("datapane") && requirements.push("datapane");

        core.info("Installing dependencies");
        await exec(`pip install ${requirements.join(" ")}`);

        if (token) {
            core.info(`Logging in to ${server}`);
            await exec(`datapane login --token=${token} --server=${server}`);
        }

        const paramsExec = Object.entries(params).map(([k, v]) => `--parameter ${k}=${v}`).join(" ");

        core.info(`Executing ${fullScriptPath}`);
        await exec(`python ${fullScriptPath} ${paramsExec}`);

    } catch (error) {
        core.setFailed(error.message);
    }
}

run();