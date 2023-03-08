import { load } from "@amcharts/amcharts5/.internal/core/util/Net";
import React, { useEffect, useState, useContext } from "react";
import GaugeChart from "react-gauge-chart";
import { ShowProgressWork } from "./ShowProgressWork";

import supabase from "../component_config/supabase";
import Appcontext from "./zustand.tsx/Appcontext";

export const ShowPerformance = (props: {
  pdkey: String;
  pdstatus: String;
  detailLine: String;
}) => {
  const { pdkey, pdstatus, detailLine } = props;
  // console.log("pdstatus", pdstatus);
  const [lineunit, setLineunit] = useState<String>("");
  useEffect(() => {
    if (detailLine) {
      setLineunit(detailLine);
    }
  }, [detailLine]);

  const [ShowDTRT, SetDTRT] = useState<any>("");
  // console.log(ShowDTRT[0]?.dtstart);
  const [dateState, useDateState] = useState(new Date());

  const fetchRuntime = async () => {
    const { data, error } = await supabase
      .from("Downtime_record")
      .select("Duration_downtime")

      .eq("PD_key", pdkey);
    // .neq("Downtime_code", "Z01")
    // .neq("Downtime_code", "D01")
    // .neq("Downtime_code", "C");

    if (data) {
      setDataduDownTime(data.map((files) => files.Duration_downtime));
    }
  };
  //========== data get DowntimeCode มาเช็คข้อมูล ================
  const [dataCheckCode, setDataCheckCode] = useState<any>("");

  // console.log("dataCheckCode", dataCheckCode);

  //-----------------------------------------------------------

  useEffect(() => {
    const fetchDTRealTime = async () => {
      const { data, error } = await supabase.rpc("dtrealtime", {
        propdkey: pdkey,
      });
      if (!error) {
        SetDTRT(data);
      }
    };
    fetchDTRealTime();
    fetchRuntime();
    fetdatacelperformance();

    const fetchCodeDowntime = async () => {
      let { data: Downtime_record, error } = await supabase
        .from("Downtime_record")
        .select("Downtime_code")
        .eq("PD_key", pdkey)
        .order("id", { ascending: false })
        .limit(1);
      if (Downtime_record?.length) {
        setDataCheckCode(Downtime_record[0].Downtime_code);
      }
    };
    if (pdstatus == "Downtime") {
      fetchCodeDowntime();
    }

    if (pdstatus == "Online") {
      setDataCheckCode({ Downtime_code: "กด Downtime ก่อนค่อยดูโว้ยยย" });
    }
  }, [pdstatus]);
  const Today = new Date().toISOString().slice(0, 10);
  const st = new Date(Today + " " + ShowDTRT[0]?.dtstart);
  const en = new Date(dateState);
  //ค่า ที่นับเป็น นาที ของ Donwtime แล้วเอามาบวก กับ Downtime ทั้งหมดของ Work ก่อนหน้านี้
  const [downtimeNumNew, setDowntimeNumNew] = useState<number>(0);
  const [downtimeBreakNew, setDowntimeBreakNew] = useState<number>(0);
  // console.log("downtimeNumNew", downtimeNumNew);
  // console.log("downtimeBreakNew ", downtimeBreakNew);

  // console.log("เวลาเริ่มดาวทาม ", ShowDTRT[0]?.dtstart);

  useEffect(() => {
    let diff = en.getTime() - st.getTime();
    let msec = diff;
    let hh = Math.floor(msec / 1000 / 60 / 60);
    msec -= hh * 1000 * 60 * 60;
    let mm = Math.floor(msec / 1000 / 60);
    msec -= mm * 1000 * 60;
    let ss = Math.floor(msec / 1000);
    msec -= ss * 1000;

    let DiffTime = Number(mm.toString().padStart(2, "0"));

    if (pdstatus == "Downtime" && dataCheckCode) {
      if (
        dataCheckCode == "Z01" ||
        dataCheckCode == "D01" ||
        dataCheckCode == "C"
      ) {
        setDowntimeBreakNew(DiffTime);
        setDowntimeNumNew(0);
      } else {
        setDowntimeNumNew(DiffTime);
      }
    }
    if (pdstatus == "Online") {
      setDowntimeNumNew(0);
      setDowntimeBreakNew(0);
      SetDTRT("");
    }
  }, [en]);

  const date: any = new Date();

  useEffect(() => {
    setInterval(() => useDateState(new Date()), 1000);
  }, []);

  const appcontext: any = useContext(Appcontext);

  // console.log("appcontext Page ShowProgress", appcontext);
  const PD_key: any = appcontext.appstate[0]?.PD_key;
  // console.log("PD_key", PD_key);
  const [loading, setLoading] = useState(false);
  // const [ShowProgress, SetShowProgress] = useState<any>("");
  // const [dataPer, setDataPer] = useState<any>(0);
  useEffect(() => {
    const DowntimeRecord = supabase
      .channel("custom-all-DowntimeRealtimeDashboard")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "Downtime_record" },
        (payload) => {
          setLoading(true);
          console.log("Change received! DowntimeRealtimeDashboard", payload);
          if (appcontext.appstate[0]?.PD_key != undefined) {
            fetdatacelperformance();
          }

          setLoading(false);
        }
      )
      .subscribe();
  }, []);

  const fetdatacelperformance = async () => {
    let { data, error } = await supabase.rpc("onperformance", {
      pdate: Today,
      prounit: lineunit,
      pd_key: pdkey,
    });

    if (error) console.error(error);
    // console.log("onperformance Success :D", data);
    else setBeforPerformance(data);
  };

  const [beforPerformance, setBeforPerformance] = useState<any>([]);
  // console.log({ beforPerformance });

  //ทำ เวลา แบบเรียวทามเอาไว้คิด performent percent แบบเรียวทามจาก client
  useEffect(() => {
    const fetchTimeStamp_Start = async () => {
      let { data: Manpower_record, error } = await supabase
        .from("Manpower_record")
        .select("TimeStamp_start")
        .eq("PD_key", appcontext.appstate[0]?.PD_key);
      if (Manpower_record?.length) {
        setTimeStampStart(Manpower_record[0].TimeStamp_start);
      }
    };

    fetchTimeStamp_Start();
  }, [appcontext]);

  const [timeStampStart, setTimeStampStart] = useState<any>(0);
  const [realtimeNakub, setRealtimeNakub] = useState<string>("");
  // console.log("realtimeNakub", realtimeNakub);
  // console.log("timeStampStart", timeStampStart);
  const realtime = date.getTime(dateState);

  useEffect(() => {
    let diff = realtime - timeStampStart;

    let hh = Math.floor(diff / 1000 / 60 / 60);
    diff -= hh * 1000 * 60 * 60;
    let mm = Math.floor(diff / 1000 / 60);
    diff -= mm * 1000 * 60;
    let ss = Math.floor(diff / 1000);
    diff -= ss * 1000;

    let DiffTime =
      hh.toString().padStart(2, "0") +
      ":" +
      mm.toString().padStart(2, "0") +
      ":" +
      ss.toString().padStart(2, "0");

    setRealtimeNakub(DiffTime);
  }, [realtime]);

  const Standard_time = appcontext.appstate[0]?.Standard_time;
  const OK_qty = appcontext.appstate[0]?.OK_qty;
  const NG_qty = appcontext.appstate[0]?.NG_qty;

  // console.log({ Standard_time });
  //=================================================================
  //======== หาDowntime ตัวที่ทำอยู่ ===================================

  // console.log({ codeAll });

  useEffect(() => {
    const fetchRuntime = async () => {
      const { data, error } = await supabase
        .from("Downtime_record")
        .select("Duration_downtime")

        .eq("PD_key", pdkey);
      // .neq("Downtime_code", "Z01")
      // .neq("Downtime_code", "D01")
      // .neq("Downtime_code", "C");

      if (data) {
        setDataduDownTime(data.map((files) => files.Duration_downtime));
      }
    };

    fetchRuntime();
  }, [pdkey]);
  const [dataduDownTime, setDataduDownTime] = useState<any>([]);
  // console.log({ dataduDownTime });
  // console.log("pdkey", pdkey);

  let sumDowntimeRealtime: number = 0;

  for (let itmeDowntime of dataduDownTime) {
    sumDowntimeRealtime += itmeDowntime;
  }
  // console.log("sumDowntimeRealtime", sumDowntimeRealtime);

  //-------------------------------------------------------------------

  //------------------------------------------------------------------
  let [durationRealtime, setDurationRealtime] = useState<any>(0);
  // console.log({ durationRealtime });
  let [runtimeData, setRuntimeData] = useState<number>(0);

  // console.log({ runtimeData });
  let [runtimeDataSec, setRuntimeDataSec] = useState<any>(0);
  // console.log({ runtimeDataSec });
  let [performancePercent, setPerformancePercent] = useState<number>(0);
  // console.log({ performancePercent });
  let [apPercent, setApPercent] = useState<number>(0);
  // console.log({ apPercent });

  useEffect(() => {
    const testaall = async () => {
      const durationReal = (realtime - timeStampStart) / 60000;

      // console.log("test00001", durationReal);

      const RuntimeData: number =
        durationReal -
        (sumDowntimeRealtime + downtimeNumNew) -
        downtimeBreakNew;

      const RuntimeDataSec = RuntimeData * 60;

      if (timeStampStart > 0) {
        await setDurationRealtime(durationReal);
        await setRuntimeData(RuntimeData);
        await setRuntimeDataSec(RuntimeDataSec);
      }
      const PerformanceBefore = beforPerformance.performancepercent / 100;

      if (Standard_time && lineunit != "") {
        let Performance_Percen =
          (await (Standard_time * (OK_qty + NG_qty))) / RuntimeDataSec;
        // console.log({ Performance_Percen });

        if (Performance_Percen != null) {
          if (PerformanceBefore > 0 && Performance_Percen != 0) {
            const PerformanceAll = (Performance_Percen + PerformanceBefore) / 2;
            // console.log({ PerformanceAll });
            if (pdstatus == "Downtime" || pdstatus == "Online") {
              await setPerformancePercent(PerformanceAll);
            }
          }
          if (Performance_Percen == 0) {
            await setPerformancePercent(PerformanceBefore);
          }
          if (PerformanceBefore == 0) {
            await setPerformancePercent(Performance_Percen);
          }
        }
      }

      //================= Availability_percent =======================
      const AvailabilityBefore = beforPerformance.availability;
      const durationBreakDowntime = beforPerformance.durationbraekdowntime;
      if (RuntimeData > 0 && timeStampStart > 0) {
        const Ap =
          RuntimeData /
          (durationReal - durationBreakDowntime - downtimeBreakNew);
        // (durationReal - durationBreakDowntime - downtimeBreakNew);
        // console.log({ Ap });
        // console.log(
        //   "AP ตัวมันเอง",
        //   RuntimeData,
        //   durationReal,
        //   durationBreakDowntime,
        //   downtimeBreakNew
        // );

        //1 = 100% เลยต้องแปลง เป็น 100ด้วยการคูณ *100
        if (Ap != null && lineunit != "") {
          if (AvailabilityBefore > 0) {
            const AvailabilityAll = (Ap * 100 + AvailabilityBefore) / 2;
            // console.log({ AvailabilityAll });
            if (pdstatus == "Downtime" || pdstatus == "Online") {
              await setApPercent(AvailabilityAll);
            }
          }
          if (AvailabilityBefore == 0 && pdstatus != "offline") {
            const AvailabilityAll = Ap * 100 + AvailabilityBefore;
            // console.log({ AvailabilityAll });
            await setApPercent(AvailabilityAll);
          }
        }
      }
      // console.log("Availability_percent", Ap);

      //------------------------------------------------------------
    };
    testaall();
    const getdataOffline = () => {
      if (pdstatus == "Offline") {
        const getdataPerformance = beforPerformance.performancepercent;
        if (getdataPerformance >= 0) {
          setPerformancePercent(beforPerformance.performancepercent / 100);
          setApPercent(beforPerformance.availability);
        }
      }

      // console.log("Status", pdstatus);
    };
    if (pdstatus != undefined) {
      getdataOffline();
    }
  }, [dateState, lineunit]);
  // console.log("beforPerformance", beforPerformance);

  useEffect(() => {
    setLoading(true);
    const fetdatacelperformance = async () => {
      let { data, error } = await supabase.rpc("onperformance", {
        pdate: Today,
        prounit: lineunit,
        pd_key: pdkey,
      });

      if (error) console.error(error);
      // console.log("onperformance Success :D", data);
      else setBeforPerformance(data);
    };
    if (appcontext.appstate[0]?.PD_key != undefined) {
      fetdatacelperformance();
    }
    setLoading(false);
  }, [appcontext]);

  // console.log({ pdstatus });

  if (loading) {
    return <div> Loading ...</div>;
  }

  return (
    <div>
      <div className="NameGauge">Performance</div>
      <GaugeChart
        id="gauge-chart2"
        nrOfLevels={10}
        percent={performancePercent ? performancePercent : 0}
        colors={["#EA4228", "#5BE12C"]}
        needleBaseColor={"#FFFFFF"}
        needleColor={"#FFFFFF"}
        textColor={"#FFFFFF "}
        formatTextValue={(value) => `${parseFloat(Number(value).toFixed(0))}%`}
      />{" "}
      <div className="NameGauge">Availability</div>
      <GaugeChart
        id="gauge-chart3"
        nrOfLevels={10}
        percent={(apPercent ? apPercent : 0) / 100}
        colors={["#EA4228", "#5BE12C"]}
        needleBaseColor={"#FFFFFF"}
        needleColor={"#FFFFFF"}
        textColor={"#FFFFFF "}
        formatTextValue={(value) => `${parseFloat(Number(value).toFixed(0))}%`}
      />
    </div>
  );
};
