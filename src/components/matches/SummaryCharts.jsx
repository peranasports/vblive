import React from "react";
import SummaryChartHeader from "./SummaryChartHeader";

function SummaryCharts({ match }) {
  return (
    <>
      <div className="flex-col max-w-xl">
        <SummaryChartHeader match={match} />
      </div>
    </>
  );
}

export default SummaryCharts;
