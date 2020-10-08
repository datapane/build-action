# build-action

Github action for building a Datapane report.

## Example Workflow

```yaml
jobs:
  build_report:
    runs-on: ubuntu-latest
    name: Build Datapane report
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v1
        with:
          python-version: 3.8
      - uses: datapane/build-action@v2
        with:
          script: "reports/dp_script.py"
          token: ${{ secrets.TOKEN }}
          parameters: '{"foo": "bar"}'
```

## Input Parameters

| Name | Description | Default | 
|--|--|--|
| script (required) | Python script/notebook to execute, relative to repo root  | None |
| token | Datapane API token to use | None |
| server | Datapane server to connect to | https://datapane.com |
| parameters | Stringified JSON object of parameter key-value pairs | `"{}"`
| requirements | Stringified JSON array of extra PyPI dependencies to install | `"[]"`
| version | Version of Datapane to install, using pip specification, e.g. ">=0.8.0,<0.9.0" | None

Note that all input parameters should be given as strings. Additionally, parameters are not currently supported when running Jupyter Notebooks - for now please convert to a Python script first.


## Running your Workflow

You can use the GH Action to run your report workflow upon git repo changes, for instance on every commit, on certain branches, etc., as specified in the [docs]().

However it's also possible to run report workflows on a schedule (for instance every week), or manually, either via the GH Action UI or in response to a webhook, in both cases with the ability to dynamically set report parameters.


### Scheduled runs

Scheduled runs can be used to update a report on a regular cadence, e.g. every week, and will show up as a new version of the report in Datapane.

GH Actions support scheduling a workflow to run using a cron syntax, as described [here](https://docs.github.com/en/free-pro-team@latest/actions/reference/events-that-trigger-workflows#scheduled-events).

For instance, to run our weekly reports on every Friday afternoon,

```yaml
on:
  schedule:
    # run at 5pm every Friday
    - cron:  '00 17 * * 5'
jobs:
  build_report:
    runs-on: ubuntu-latest
    name: Run end-of-week Datapane reports
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v1
        with:
          python-version: 3.8
      - uses: datapane/build-action@v2
        with:
          script: "reports/end_of_week.py"
          token: ${{ secrets.TOKEN }}
```


### Manual runs


If your report has user-configurable parameters, you can define these in your workflow and enter them via the GH Action site when manually triggering your workflow.

The parameters in the GH Action UI are all strings, however Datapane will convert them to primitive values as needed, e.g. the string `false` becomes a python boolean `False` value. Th

Workflow parameters are described in the [docs](https://docs.github.com/en/free-pro-team@latest/actions/reference/events-that-trigger-workflows#workflow_dispatch). The input must manually be converted to the `parameters` json string to pass to the Datapane `build-action` as follows.


```yaml
on:
  workflow_dispatch:
    inputs:
      company:
        description: 'Company stock name'
        required: true
        default: 'GOOG'
      market:
        description: 'Country to report for'
        required: false
jobs:
  build_report:
    runs-on: ubuntu-latest
    name: Run Parameterised Datapane report
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v1
        with:
          python-version: 3.8
      - uses: datapane/build-action@v2
        with:
          script: "reports/financials.py"
          token: ${{ secrets.TOKEN }}
          parameters: ${{ toJson(github.event.inputs) }}
```

#### Trigger by Github UI

See GH [docs](https://docs.github.com/en/free-pro-team@latest/actions/managing-workflow-runs/manually-running-a-workflow#running-a-workflow-on-github) for running a parameterised datapane workflow using the GH Action UI.


### Trigger by API/Webhook

See GH [docs](https://docs.github.com/en/free-pro-team@latest/rest/reference/actions#create-a-workflow-dispatch-event) for running a parameterised datapane workflow via an API Call.

Essentially, you need to send a POST request to `/repos/{owner}/{repo}/actions/workflows/{workflow_name}/dispatches`. So for a repo called `acme/reporting`, with a workflow as above called `financial_report` the following would work,

```sh
curl \
  -u GH_USERNAME:GH_TOKEN \
  -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/acme/reporting/actions/workflows/financial_report/dispatches \
  -d '{"ref":"ref", "inputs": { "company": "APPL", "market": "UK"} }'
```

# Advanced Usage

## Caching
Pip dependencies can be cached via [actions/cache](https://docs.github.com/en/free-pro-team@latest/actions/guides/building-and-testing-python#caching-dependencies).
The cache key should contain the `requirements` and `install_from_git` input parameters, if they're used. 

An example workflow on Ubuntu with caching is shown below:

```yaml
env:
  install_from_git: "true"
  requirements: '["networkx"]'
jobs:
  build_report:
    runs-on: ubuntu-latest
    name: Build Datapane report
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v1
        with:
          python-version: 3.8
      - uses: actions/cache@v2
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ env.requirements }}-${{ env.version }}
      - uses: datapane/build-action@v2
        with:
          script: "reports/financials.py"
          token: ${{ secrets.TOKEN }}
          install_from_git: "${{ env.install_from_git }}"
          requirements: "${{ env.requirements }}"
```


#### Caching the packages

It's also possible to cache the packages themselves, speeding up action running, by creating a `venv` first, activating it, and caching it between runs.

```yaml
env:
  install_from_git: "true"
  requirements: '["networkx==2.5", "pandas==1.0.5"]'
jobs:
  build_report:
    runs-on: ubuntu-latest
    name: Build Datapane report
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v1
        with:
          python-version: 3.8
      - uses: actions/cache@v2
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ env.requirements }}-${{ env.version }}
      - uses: actions/cache@v2
        with:
          path: ~/.venv
          key: ${{ runner.os }}-pip-${{ env.requirements }}-${{ env.version }}
      - name: Create and activate venv
        run: |
          python3 -m venv ~/.venv
          echo "~/.venv/bin" >> $GITHUB_PATH
      - uses: datapane/build-action@v2
        with:
          script: "reports/dp_script.py"
          token: ${{ secrets.TOKEN }}
          requirements: "${{ env.requirements }}"
```

Note that when doing this, ensure that you clearly specify your package version in your requirements otherwise you may end up with cache hits for old versions of your packages.
