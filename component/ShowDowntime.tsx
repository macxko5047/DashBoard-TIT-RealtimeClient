import { useEffect, useRef, useState } from "react";
import supabase from "../component_config/supabase";
import ChartDataLabels from "chartjs-plugin-datalabels";
// import { Chart, ChartItem } from "chart.js";
import { Chart, ChartItem, registerables, ChartType } from "chart.js";
Chart.register(...registerables);

export const ShowDowntime = (props: { detailLine: String }) => {
  const [Downtime, SetDTData] = useState<any>([]);
  const Today = new Date().toISOString().slice(0, 10);
  const { detailLine } = props;
  const [lineunit, setLineunit] = useState<String>("");

  useEffect(() => {
    if (detailLine) {
      setLineunit(detailLine);
    }
  }, [detailLine]);

  const DowntimeRecord = supabase
    .channel("custom-downtime-channel")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "Downtime_record" },
      (payload) => {
        fetchDataDT();
      }
    )
    .subscribe();

  const fetchDataDT = async () => {
    const { data, error } = await supabase.rpc("showdtline", {
      prounit: lineunit,
      pdate: Today,
    });
    if (!error) {
      SetDTData(data);
    }
  };

  useEffect(() => {
    const fetchDataDT = async () => {
      const { data, error } = await supabase.rpc("showdtline", {
        prounit: lineunit,
        pdate: Today,
      });
      if (!error) {
        SetDTData(data);
      }
    };

    fetchDataDT();
  }, [lineunit]);

  const dataDT = {
    labels: Downtime.map(
      (row: {
        dcode: String;
        duration: Number;
        durationline: Number;
        alldt: Number;
      }) =>
        row.dcode +
        " " +
        ((Number(row.duration) / Number(row.alldt)) * 100).toFixed(1) +
        "%" +
        " " +
        (Number(row.duration) / 60).toFixed(2) +
        "h"
    ),
    datasets: [
      {
        label: "Down time reason",
        data: Downtime.map((row: { duration: Number }) => row.duration),
      },
    ],
  };

  const canvasDT = useRef(
    typeof document !== "undefined" ? document.createElement("canvas") : null
  );

  useEffect(() => {
    const ctx = canvasDT.current?.getContext("2d") as ChartItem;

    const config: any = {
      type: "pie" as ChartType,
      data: dataDT,
      width: 1,
      height: 1,

      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          title: {
            display: true,
            text: "Down time Reason",
            color: ["rgb(255, 255, 255)"],
            font: {
              size: 20,
              // style: 'italic',
              family: "serif",
            },
            padding: {
              top: -2,
              right: 1,
              bottom: 16,
              left: 2,
            },
          },
          datalabels: {
            color: "white",
            formatter: (
              value: number,
              context: { chart: { data: { datasets: { data: any }[] } } }
            ) => {
              const datapoints = context.chart.data.datasets[0].data;
              function totalSum() {
                return Downtime[0]?.alldt;
              }
              const totalvalue = datapoints.reduce(totalSum, 0);
              const percentageValue = ((value / totalvalue) * 100).toFixed(1);
              return percentageValue + "%";
              // return percentageValue+"% ("+value+" Min.)";
            },
            anchor: "end",
            align: "end",
            offset: 1,
          },
          legend: {
            display: true,
            position: "bottom",
            align: "start",
            title: {
              display: true,
              padding: 1,
            },
            labels: {
              color: ["rgb(255, 255, 255)"],
            },
          },
        },
      },
      plugins: [ChartDataLabels],
    };

    const myLineChart = new Chart(ctx, config);

    return function cleanup() {
      myLineChart.destroy();
    };
  }, [Downtime]);

  return (
    <div>
      <canvas ref={canvasDT} />
    </div>
  );
};
