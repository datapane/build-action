"""datapane script"""
import pandas as pd
import datapane as dp


def gen_df(dim: int = 4) -> pd.DataFrame:
    axis = [i for i in range(0, dim)]
    data = {"x": axis, "y": axis}
    return pd.DataFrame.from_dict(data)

md = f"""
## datapane/build-action sample report
### Params
{dp.Params["foo"]=}
{dp.Params["qux"]=}
"""

# Report
report = dp.Report(
    md,
    "### Table",
    dp.Table(gen_df(10000), can_pivot=False)
)

report.publish(name="build_action_test_report")