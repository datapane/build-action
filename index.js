const core = require("@actions/core");
const { exec } = require("@actions/exec");
const path = require("path");

const pushUniq = (el, arr) => {
    !arr.includes(el) && arr.push(el);
};

const gitInstall = async () => {
    await exec("git clone https://github.com/datapane/datapane datapane-cli");
    await exec("rm datapane-cli/src/datapane/resources/local_report/local-report-base.css datapane-cli/src/datapane/resources/local_report/local-report-base.js");
    await exec("touch datapane-cli/src/datapane/resources/local_report/local-report-base.css datapane-cli/src/datapane/resources/local_report/local-report-base.js");
    await exec("pip install ./datapane-cli");
};

async function run() {
     try {
        const scriptPath = core.getInput("script");
        const token = core.getInput("token");
        const requirements = JSON.parse(core.getInput("requirements"));
        const version = core.getInput("version");
        const params = JSON.parse(core.getInput("parameters"));
        const server = core.getInput("server");

        const fullScriptPath = path.join(process.env.GITHUB_WORKSPACE, scriptPath);
        const isNotebook = scriptPath.split(".").pop() === "ipynb";
        const installFromGit = version === "git";

        !installFromGit && pushUniq(`datapane${version}`, requirements);
        isNotebook && pushUniq("nbconvert", requirements);

        core.info("Installing dependencies");
        requirements.length > 0 && await exec(`pip install ${requirements.join(" ")}`);
        installFromGit && await gitInstall();

        if (token) {
            core.info(`Logging in to ${server}`);
            await exec(`datapane login --token=${token} --server=${server}`);
        }

        const paramsExec = Object.entries(params).map(([k, v]) => `--parameter ${k}=${v}`).join(" ");

        core.info(`Executing ${fullScriptPath}`);
        await exec(isNotebook ? `jupyter-nbconvert --to notebook --execute ${fullScriptPath}` : `python ${fullScriptPath} ${paramsExec}`);

    } catch (error) {
        core.setFailed(error.message);
    }
}

run();