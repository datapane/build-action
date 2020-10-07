const core = require("@actions/core");
const { exec } = require("@actions/exec");
const path = require("path");

const pushUniq = (el, arr) => {
    !arr.includes(el) && arr.push(el);
};

async function run() {
     try {
        const scriptPath = core.getInput("script_path");
        const token = core.getInput("token");
        const requirements = JSON.parse(core.getInput("requirements"));
        const params = JSON.parse(core.getInput("parameters"));
        const server = core.getInput("server");
        const fullScriptPath = path.join(process.env.GITHUB_WORKSPACE, scriptPath);

        const isNotebook = scriptPath.split(".").pop() === "ipynb";
        pushUniq("datapane", requirements);
        isNotebook && pushUniq("nbconvert", requirements);

        core.info("Installing dependencies");
        await exec(`pip install ${requirements.join(" ")}`);

        if (token) {
            core.info(`Logging in to ${server}`);
            await exec(`datapane login --token=${token} --server=${server}`);
        }

        const paramsExec = Object.entries(params).map(([k, v]) => `--parameter ${k}=${v}`).join(" ");

        core.info(`Executing ${fullScriptPath}`);
        await exec(isNotebook ? `nbconvert --to notebook --execute ${fullScriptPath}` : `python ${fullScriptPath} ${paramsExec}`);

    } catch (error) {
        core.setFailed(error.message);
    }
}

run();