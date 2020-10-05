const core = require("@actions/core");
const { exec } = require("@actions/exec");

async function run() {
     try {
        const scriptPath = core.getInput("script_path");
        const token = core.getInput("token");
        const requirements = JSON.parse(core.getInput("requirements"));
        const params = core.getInput("parameters");
        const server = core.getInput("server");

        !requirements.includes("datapane") && requirements.push("datapane");

        core.info(requirements);

        for (const requirement in requirements) {
            core.info(`installing ${requirement}`);
            await exec(`pip install ${requirement}`);
        }

        if (token) {
            core.info(`Logging in to ${server}`);
            await exec(`datapane login --token=${token} --server=${server}`);
        }

        core.info(`Executing ${scriptPath}`);
        await exec(`python ${scriptPath}`);

    } catch (error) {
        core.setFailed(error.message);
    }
}

run();