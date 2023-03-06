import { useEffect, useState } from "react";
import supabase from "../component_config/supabase";

export const ShowDTRealTime = (props: {
  pdkey: String;
  pdstatus: String;
  detailLine: String;
}) => {
  const { pdkey, pdstatus, detailLine } = props;

  const [ShowDTRT, SetDTRT] = useState<any>("");
  const Today = new Date().toISOString().slice(0, 10);
  const [dateState, useDateState] = useState(new Date());
  const [TimeState, SetTimeState] = useState<any>("");
  let bgDT = "";
  const [lineunit, setLineunit] = useState<String>("");
  useEffect(() => {
    setInterval(() => useDateState(new Date()), 1000);
  }, []);

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

    // if (detailLine) {
    //   setLineunit(detailLine);
    // }
  }, [pdstatus]);

  const st = new Date(Today + " " + ShowDTRT[0]?.dtstart);
  const en = new Date(dateState);

  useEffect(() => {
    let diff = en.getTime() - st.getTime();
    let msec = diff;
    let hh = Math.floor(msec / 1000 / 60 / 60);
    msec -= hh * 1000 * 60 * 60;
    let mm = Math.floor(msec / 1000 / 60);
    msec -= mm * 1000 * 60;
    let ss = Math.floor(msec / 1000);
    msec -= ss * 1000;

    let DiffTime =
      hh.toString().padStart(2, "0") +
      ":" +
      mm.toString().padStart(2, "0") +
      ":" +
      ss.toString().padStart(2, "0");

    SetTimeState(DiffTime);
  }, [en]);

  if (pdstatus === "Downtime") {
    return (
      <div>
        <style jsx global>{`
          .DTNONE {
            display: none;
          }
          .DTSHOW {
            font-size: 16px;
            display: block;
            text-align: center;
            border-radius: 5px;
            padding: 4px;
            margin-top: 3px;
            font-weight: Bold;
            color: #fff;
            background-color: rgb(118, 16, 16, 0.5);
            position: relative;
          }
        `}</style>
        <div className="FootDowntime">
          <div className="DTSHOW">
            {ShowDTRT[0]?.dtreason}
            <div style={{ padding: 1, fontSize: 24 }}>{TimeState}</div>
          </div>
        </div>
      </div>
    );
  } else {
    return <div></div>;
  }
};
