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
      - uses: datapane/build-action@v1
        with:
          script_path: "tests/dp_script.py"
          token: ${{ secrets.TOKEN }}
          parameters: '{"foo": "bar"}'
```

## Input Parameters

| Name | Description | Default | 
|--|--|--|
| script_path (required) | Path of the Python script to execute, relative to the repo root  | No |
| token | Datapane API token to use | No |
| server | Server to log in to | https://datapane.com |
| parameters | Stringified JSON object of parameter key-value pairs | `"{}"`
| requirements | Stringified JSON array of extra PyPI dependencies to install | `"[]"`
| install_from_git | Build Datapane from Github if `"true"`, and from PyPI if `"false"` | `"false"`

Note that all input parameters should be given as strings.

## Caching
Pip dependencies can be cached via [actions/cache](https://docs.github.com/en/free-pro-team@latest/actions/guides/building-and-testing-python#caching-dependencies).
The cache key should contain the `requirements` and `install_from_git` input parameters, if they're used. 

An example workflow on Ubuntu with caching is shown below:

```yaml
env:
  install_from_git: "true"
  requirements: '["networkx"]'
jobs:
  test_job:
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
          key: ${{ runner.os }}-pip-${{ env.requirements }}-${{ env.install_from_git }}
      - uses: Buroni/dp-actions-test@main
        with:
          script_path: "tests/dp_script.py"
          token: ${{ secrets.TOKEN }}
          install_from_git: "${{ env.install_from_git }}"
          requirements: "${{ env.requirements }}"
          parameters: '{"foo": "bar"}'
```
