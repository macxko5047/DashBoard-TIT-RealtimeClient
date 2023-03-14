import React, { useEffect, useState, useContext } from "react";
import supabase from "../component_config/supabase";
import Appcontext from "./zustand.tsx/Appcontext";
import DashBoard from "../pages/DashBoard1";
import { useRouter } from "next/router";

type Props = {
  pdkey: String;
  pdstatus: String;
  detailLine: String;
  languagesUP: String;
};

const ShowAllDay = (props: Props) => {
  const router = useRouter();
  const linename = router.query.linename || "AHPB-01";

  const appcontext: any = useContext(Appcontext);
  // console.log("appcontext Page ShowProgress", appcontext);
  // console.log({ linename });
  const { pdkey, pdstatus, detailLine, languagesUP } = props;
  const Today = new Date().toISOString().slice(0, 10);
  const [lineunit, setLineunit] = useState<String>("");
  const [beforPerformance, setBeforPerformance] = useState<any>([]);

  const [quality, setQuality] = useState<number>(0);
  // console.log({ quality });

  const [qualityAll, setQualityAll] = useState<number>(0);
  // console.log({ qualityAll });
  let [oeeAll, setOeeAll] = useState<any>(0);
  // console.log({ oeeAll });

  // console.log({ beforPerformance });
  useEffect(() => {
    const OK_qty: number = appcontext.appstate[0]?.OK_qty;
    const NG_qty: number = appcontext.appstate[0]?.NG_qty;

    const celculateAll = async () => {
      const Qualitypercent: number = OK_qty / (OK_qty + NG_qty);
      setQuality(Qualitypercent);
    };
    if (OK_qty) {
      celculateAll();
    }

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
  }, [appcontext]);

  const qualityBefore = beforPerformance.quality;
  // console.log({ qualityBefore });
  useEffect(() => {
    if (qualityBefore != undefined) {
      if (quality == 0) {
        if (pdstatus == "Online" || pdstatus == "Downtime") {
          setQualityAll(qualityBefore);
        }
      }
      if (qualityBefore > 0 && quality != 0) {
        const QualityAll = (qualityBefore + quality * 100) / 2;
        //*100 เพราะ ค่า quality = 1 ไม่ใช่ 100
        // console.log({ QualityAll });
        if (pdstatus == "Online" || pdstatus == "Downtime") {
          setQualityAll(QualityAll);
        }
      }
      if (qualityBefore == 0) {
        const QualityAll = qualityBefore + quality * 100;
        //*100 เพราะ ค่า quality = 1 ไม่ใช่ 100
        // console.log({ QualityAll });
        if (pdstatus == "Online" || pdstatus == "Downtime") {
          setQualityAll(QualityAll);
        }
      }
    }
  }, [quality, qualityBefore]);

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
  //===========get performent ,Availability ===============================
  const [ShowDTRT, SetDTRT] = useState<any>("");
  // console.log(ShowDTRT[0]?.dtstart);
  const [dateState, useDateState] = useState(new Date());
  //=====================================================================

  const [dataCheckCode, setDataCheckCode] = useState<any>("");

  // console.log("dataCheckCode", dataCheckCode);

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
    if (pdstatus == "Offline") {
      fetdatacelperformance();
    }

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
  // console.log({ beforPerformance });

  const st = new Date(Today + " " + ShowDTRT[0]?.dtstart);
  const en = new Date(dateState);
  //ค่า ที่นับเป็น นาที ของ Donwtime แล้วเอามาบวก กับ Downtime ทั้งหมดของ Work ก่อนหน้านี้
  const [downtimeNumNew, setDowntimeNumNew] = useState<number>(0);
  const [downtimeBreakNew, setDowntimeBreakNew] = useState<number>(0);
  //  console.log("downtimeNumNew", downtimeNumNew);
  //  console.log("downtimeBreakNew ", downtimeBreakNew);

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
        setDowntimeBreakNew(0);
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

  const TimeStart: any = date.getTime;
  // console.log("appcontext Page ShowProgress", appcontext);
  const PD_key: any = appcontext.appstate[0]?.PD_key;
  // console.log("PD_key", PD_key);
  const [loading, setLoading] = useState(false);
  // const [ShowProgress, SetShowProgress] = useState<any>("");
  // const [dataPer, setDataPer] = useState<any>(0);

  const DowntimeRecordShowAll = supabase
    .channel("custom-all-DowntimeShowALL")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "Downtime_record",
        filter: "PD_key=eq." + pdkey,
      },
      (payload) => {
        setLoading(true);
        console.log(
          "Change received! DowntimeRealtimeDashboardShowALL",
          payload
        );
        if (appcontext.appstate[0]?.PD_key != undefined) {
          fetdatacelperformance();
        }
        setLoading(false);
      }
    )
    .subscribe();

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
  // console.log("timeStampStart", timeStampStart);
  const realtime = date.getTime(dateState);

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

    if (detailLine) {
      setLineunit(detailLine);
    }
  }, [pdkey, detailLine]);
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
  let [runtimeData, setRuntimeData] = useState<any>(0);
  // console.log({ runtimeData });
  let [runtimeDataSec, setRuntimeDataSec] = useState<any>(0);
  // console.log({ runtimeDataSec });
  //ใช้เอาไป หาค่า OEE =============================
  let [performancePercent, setPerformancePercent] = useState<any>(0);
  // console.log({ performancePercent });
  let [apPercent, setApPercent] = useState<any>(0);
  // console.log({ apPercent });

  //------------------------------------------------------------

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
      // console.log(Standard_time);

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
        //1 = 100% เลยต้องแปลง เป็น 100ด้วยการคูณ *100
        if (Ap != null) {
          if (AvailabilityBefore > 0) {
            const AvailabilityAll = (Ap * 100 + AvailabilityBefore) / 2;
            // console.log({ AvailabilityAll });
            await setApPercent(AvailabilityAll);
          }
          if (AvailabilityBefore == 0) {
            const AvailabilityAll = Ap * 100 + AvailabilityBefore;
            // console.log({ AvailabilityAll });
            await setApPercent(AvailabilityAll);
          }
        }
      }
      // console.log("Availability_percent", Ap);

      //------------------------------------------------------------
      //========== OEE percent ===============================
      const oeeCel =
        performancePercent * (apPercent / 100) * (qualityAll / 100);
      // console.log({ oeeCel });

      if (oeeCel != null) {
        if (pdstatus == "Online" || pdstatus == "Downtime") {
          setOeeAll(oeeCel);
        }
      }

      //------------------------------------------------------
    };
    testaall();
    if (pdstatus == "Offline") {
      const getdataOeeAll = beforPerformance.oeepercent;
      if (getdataOeeAll > 0) {
        setOeeAll(beforPerformance.oeepercent / 100);
        setQualityAll(beforPerformance.quality);
      }
    }
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

  useEffect(() => {
    const celculateOee = async () => {};
    celculateOee;
  }, [performancePercent, apPercent, qualityAll]);

  const [dataAVG, setDataAVG] = useState<any>([]);

  useEffect(() => {
    const fetdatatest = async () => {
      let { data, error } = await supabase.rpc("onperformance", {
        pdate: Today,
        prounit: linename,
        pd_key: appcontext.appstate[0]?.PD_key,
      });

      if (error) console.error(error);
      // console.log("DataAVG", data);
      else setDataAVG(data);
    };
    if (appcontext.appstate[0]?.PD_key != undefined) {
      fetdatatest();
    }
  }, [appcontext]);

  if (loading) {
    return <div> Loading ...</div>;
  }

  return (
    <div>
      <p>
        Performance :{" "}
        {((performancePercent ? performancePercent : 0) * 100).toFixed(2)}%
        &nbsp;&nbsp;&nbsp;Ava : {apPercent.toFixed(2)}%
      </p>
      <p>
        &nbsp;&nbsp;Quality
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;
        {qualityAll.toFixed(2)}% &nbsp;&nbsp;&nbsp;OEE :{" "}
        {(oeeAll * 100).toFixed(2)}%{" "}
      </p>
    </div>
  );
};
export default ShowAllDay;
