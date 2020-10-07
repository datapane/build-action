"""datapane script"""
import pandas as pd
import datapane as dp


def gen_df(dim: int = 4) -> pd.DataFrame:
    axis = [i for i in range(0, dim)]
    data = {"x": axis, "y": axis}
    return pd.DataFrame.from_dict(data)

# Report
report = dp.Report(
    f"## Sample report\n{dp.Params['foo']}",
    dp.Table(gen_df(10000), can_pivot=False)
)

report.publish(name="layout_report")