import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import GaugeChart from "react-gauge-chart";
import supabase from "./supabase";

export const ShowOEE = (props: { pdkey: String; pdstatus: String }) => {
  const router = useRouter();
  const linename = router.query.linename || "AHPB-01";

  console.log({ linename });
  const { pdkey, pdstatus } = props;
  const [Oeedata, SetOeeData] = useState<any>([]);
  const Today = new Date().toISOString().slice(0, 10);
  const lineunit = "AHPB-01";
  const [showProgress, setShowProgress] = useState<any>(null);
  const [showBeforeProgress, setShowBeforeProgress] = useState<any>(null);
  const [quality, setQuality] = useState<number>(0);
  const [oeePercent, setOeePecent] = useState<number>(0);

  const fetchDataOEE = async () => {
    const { data, error } = await supabase.rpc("showoeeline", {
      prounit: linename,
      pdate: Today,
      pstatus: pdstatus,
    });
    if (!error) {
      console.log({ data });
      SetOeeData(data);
    }
  };

  //*** */
  const fetchShowProgress = async () => {
    console.log({ pdkey });
    const { data, error } = await supabase.rpc("onprogress", {
      propdkey: pdkey,
    });

    console.log({ data });
    if (!error) {
      if (data) {
        setShowProgress(data[0]);
      }
    }
  };

  const fetchBeforeProgress = async () => {
    const { data, error } = await supabase.rpc("before_progress", {
      linename,
    });

    if (!error) {
      setShowBeforeProgress(data[0]);
    }

    console.log({ data });
  };

  useEffect(() => {
    if (pdkey != "undefined") {
      console.log({ pdkey });
      // const fetchDataOEE = async () => {
      //   console.log("fetchDataOEE---------------------");
      //   const { data, error } = await supabase.rpc("showoeeline", {
      //     prounit: linename,
      //     pdate: Today,
      //     pstatus: pdstatus,
      //   });
      //   if (!error) {
      //     console.log({ data });
      //     SetOeeData(data);
      //   }

      // };

      // fetchDataOEE();
      const ProductionHistory = supabase
        .channel("oee-channel")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "Production_history",
            filter: "Production_unit=eq." + lineunit,
          },
          async (payload) => {
            await fetchDataOEE();
            await fetchShowProgress();
          }
        )
        .subscribe();

      const DowntimeRecord = supabase
        .channel("oee-channel")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "Downtime_record",
            filter: "PD_key=eq." + pdkey,
          },
          async (payload) => {
            await fetchDataOEE();
            await fetchShowProgress();
          }
        )
        .subscribe();

      (async function () {
        await Promise.all([
          await fetchDataOEE(),
          await fetchShowProgress(),
          await fetchBeforeProgress(),
        ]);
      })();
    }
  }, [pdkey]);

  const Summary = () => {
    let Perfor = 0;
    let Ava = 0;
    let AvaTemp = 0;
    let Quality = 0;
    let OeePercent = 0;

    console.log({ showProgress, showBeforeProgress });
    if (showProgress && showBeforeProgress) {
      const CurrentRuntime = showProgress.duration - showProgress.downtime;
      const CurrentDuration = showProgress.duration;
      const BeforeDuration = showBeforeProgress.duration;
      const BeforeRuntime = showBeforeProgress.runtime;

      AvaTemp =
        (CurrentRuntime + BeforeRuntime) / (CurrentDuration + BeforeDuration);

      console.log({ AvaTemp });
      Ava = parseFloat(Number(AvaTemp * 100).toFixed(0));

      if (isNaN(Ava)) Ava = 0;

      console.log({ Oeedata });

      Perfor = parseFloat(Number(Oeedata[0]?.performance).toFixed(0));

      console.log({ Perfor });
      let PerforPro =
        (showProgress.std * (showProgress.okqty + showProgress.ngqty)) /
        (showProgress.duration - showProgress.downtime);

      if (isNaN(PerforPro)) PerforPro = 0;

      if (Perfor > 0) {
        Perfor = parseFloat(
          Number((Perfor + PerforPro) / Oeedata[0].proamount).toFixed(0)
        );
      } else {
        Perfor = parseFloat(Number(Perfor + PerforPro).toFixed(0));
      }
      if (isNaN(Perfor)) Perfor = 0;

      Quality =
        (Oeedata[0]?.okqty + showProgress.okqty) /
        (Oeedata[0]?.okqty +
          showProgress.okqty +
          (Oeedata[0]?.ngqty + showProgress.ngqty));
      console.log({ Quality });
      //convert Quality to number 0 digit
      Quality = parseFloat(Number(Quality).toFixed(0));
      console.log({ Quality });
      setQuality(Number(Quality));
      if (isNaN(Quality)) Quality = 0;
    } else {
      // AvaTemp = Number(showProgress.runtime) / Number(showProgress.duration);
      // console.log({ AvaTemp });
      // Ava = parseFloat(Number(AvaTemp * 100).toFixed(0));
      if (isNaN(Ava)) Ava = 0;

      Perfor = parseFloat(Number(showProgress?.performance).toFixed(0));
      if (isNaN(Perfor)) Perfor = 0;

      Quality = Oeedata[0]?.okqty / (Oeedata[0]?.okqty + Oeedata[0]?.ngqty);
      Quality = parseFloat(Number(Quality).toFixed(0));

      setQuality(Number(Quality));
      if (isNaN(Quality)) Quality = 0;
    }
    
    let oee = (Ava * Perfor * Quality * 100) / (100 * 100 * 100);

    console.log({ Ava, Perfor, Quality });
    console.log({ oee });
    if (isNaN(oee)) oee = 0;
    console.log({ Ava });
    // OeePercent = parseFloat(Number(oee).toFixed(0));
    console.log({ OeePercent });
    setOeePecent(oee);
    if (isNaN(OeePercent)) OeePercent = 0;
    if (oee == 0 ){
      const performancePercen  = (Number(localStorage.getItem("PerStopWO")))
      const availabilityPercen = (Number(localStorage.getItem("AvaStopWO")))
      const celculateOEE = performancePercen * availabilityPercen * Quality / (10000)
      console.log('celculateOEE',celculateOEE);
      
      setOeePecent(celculateOEE )
    }
  };

  useEffect(() => {
    Summary();
  }, [showProgress, showBeforeProgress, Oeedata]);

//   useEffect(()=>{
// if(showProgress == null){
//   Summary();
// }
//   },[])
  return (
    <div>
      <div className="NameGauge">Quality</div>
      <GaugeChart
        id="gauge-chart4"
        nrOfLevels={10}
        percent={quality ? quality : 0}
        colors={["#EA4228", "#5BE12C"]}
        needleBaseColor={"#FFFFFF"}
        needleColor={"#FFFFFF"}
        textColor={"#FFFFFF "}
        formatTextValue={(value) => `${parseFloat(Number(value).toFixed(0))}%`}
      />
      <div className="NameGauge">OEE</div>
      <GaugeChart
        id="gauge-chart4"
        nrOfLevels={10}
        percent={oeePercent ? oeePercent : 0}
        colors={["#EA4228", "#5BE12C"]}
        needleBaseColor={"#FFFFFF"}
        needleColor={"#FFFFFF"}
        textColor={"#FFFFFF "}
        formatTextValue={(value) => `${parseFloat(Number(value).toFixed(0))}%`}
      />
    </div>
  );
};
