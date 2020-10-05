const core = require("@actions/core");
const { exec } = require("@actions/exec");

async function run() {
     try {
        const scriptPath = core.getInput("path");
        const token = core.getInput("token");
        const requirements = JSON.parse(core.getInput("requirements"));
        const params = core.getInput("parameters");
        const server = core.getInput("server");

        !requirements.includes("datapane") && requirements.push("datapane");

        for (const requirement in requirements) {
            await exec(`pip install ${requirement}`);
        }

        if (token) {
            await exec(`datapane login --token=${token} --server=${server}`);
        }

        await exec(`python ${scriptPath}`);

    } catch (error) {
        core.setFailed(error.message);
    }
}

run();