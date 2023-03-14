import { useEffect, useRef, useState, useContext } from "react";
import GaugeChart from "react-gauge-chart";
import supabase from "../component_config/supabase";
import Appcontext from "./zustand.tsx/Appcontext";
import { useTranslation } from "react-i18next";

export const ShowProgress = (props: {
  pdstatus: string;
  pdkey: string;
  detailLine: string;
  languagesUP: string;
}) => {
  const { pdkey, pdstatus, detailLine, languagesUP } = props;
  // console.log({ pdstatus });
  // const mounted = useRef(false);
  // const [ShowProgress, SetShowProgress] = useState<any>("");
  const { t, i18n } = useTranslation(); //language
  const [lineunit, setLineunit] = useState<string>("");
  // console.log("lineunit", lineunit);
  useEffect(() => {
    if (detailLine) {
      setLineunit(detailLine);
    }
  }, [detailLine]);

  const appcontext: any = useContext(Appcontext);
  // console.log("appcontext Page ShowProgress", appcontext);

  // const ProductionHistory = supabase
  //   .channel("custom-alldw-ShowProgressRealtime")
  //   .on(
  //     "postgres_changes",
  //     { event: "*", schema: "public", table: "Production_history" },
  //     (payload) => {
  //       console.log("Change received ShowProgressRealtime !!!", payload);
  //     }
  //   )
  //   .subscribe();

  const [progressShow, setProgressShow] = useState<number>(0);
  // console.log({ progressShow });

  const ProgressShow =
    (appcontext.appstate[0]?.OK_qty / appcontext.appstate[0]?.Open_qty) * 100;

  useEffect(() => {
    if (pdstatus != undefined && lineunit != "") {
      if (ProgressShow > 0) {
        setProgressShow(Number(ProgressShow.toFixed(0)));
      }

      if (pdstatus == "Offline") {
        // console.log("test return");

        setProgressShow(0);
      }
    }
    // console.log({ pdstatus });
  }, [appcontext, pdstatus, lineunit]);
  // console.log({ lineunit });

  return (
    <div>
      <div className="NameGauge">{t("Progress")}</div>
      <GaugeChart
        id="gauge-progress"
        nrOfLevels={1}
        percent={progressShow / 100}
        arcsLength={[progressShow / 100, (100 - progressShow) / 100]}
        colors={["#5BE12C", "rgb(250, 214, 209, 0.15)"]}
        needleBaseColor={"#FFFFFF"}
        needleColor={"#FFFFFF"}
        textColor={"#FFFFFF "}
      />
    </div>
  );
};
