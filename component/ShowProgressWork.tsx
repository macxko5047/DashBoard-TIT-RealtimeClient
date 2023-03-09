import React, { useEffect, useState, useContext } from "react";
import supabase from "../component_config/supabase";
import Appcontext from "./zustand.tsx/Appcontext";
import axios from "axios";

export const ShowProgressWork = (props: {
  pdkey: string;
  pdstatus: string;
  detailLine: string;
}) => {
  const { pdkey, pdstatus, detailLine } = props;

  console.log({ detailLine });

  const Today = new Date().toISOString().slice(0, 10);
  const appcontext: any = useContext(Appcontext);
  const [lineunit, setLineunit] = useState<string>();
  // console.log("lineunit", lineunit);
  const [dataUP, setDataUP] = useState<any>([]);
  const [dataShow, setDataShow] = useState<any>([]);
  // console.log({ dataShow });
  const [dataManpower, setDataManpower] = useState<any>("");
  console.log("dataManpower", dataManpower);

  const dataUserID = dataShow[0]?.OP_confirm_before
    ? dataShow[0]?.OP_confirm_before
    : "";

  useEffect(() => {
    if (detailLine) {
      setLineunit(detailLine);
    }
  }, [detailLine]);

  useEffect(() => {
    // if (dataUP != null) {
    const datanewupdateRealtime = [
      {
        OK_qty: dataUP.OK_qty,
        NG_qty: dataUP.NG_qty,
        Open_qty: dataUP.Open_qty,
        PD_key: dataUP.PD_key,
        Production_unit: dataUP.Production_unit,
        Standard_time: dataUP.Standard_time,
        Work_order_id: dataUP.Work_order_id,
        OP_confirm_before: dataUP.OP_confirm_before,
      },
    ];
    // console.log("dataUP OK_qty", datanewupdateRealtime);
    if (detailLine != "") {
      setDataShow(datanewupdateRealtime);
      appcontext.setAppstate(datanewupdateRealtime);
    }

    // }
  }, [dataUP]);

  useEffect(() => {
    if (pdstatus != undefined) {
      if (pdstatus == "Offline") {
        setFgShow(0);
        setNgShow(0);
        setFgPercen(0);
        setNgPercen(0);
      }
    }
  }, [pdstatus, appcontext]);
  // console.log({ pdstatus });

  useEffect(() => {
    const ProductionHistory = supabase
      .channel("custom-all-channelShoProgressWork")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Production_history" },
        (payload) => {
          console.log("Change received! channelShoProgressWork", payload);
          setDataUP(payload.new);
        }
      )
      .subscribe();
  }, []);

  const [loading, setLoading] = useState(false);
  if (loading) {
    return (
      <div>
        <p>Loading ....</p>
      </div>
    );
  }
  useEffect(() => {
    setLoading(true);
    const fetchdata_qty = async () => {
      let { data: Production_history, error } = await supabase
        .from("Production_history")
        .select(
          "OK_qty, NG_qty, Open_qty,PD_key,Work_order_id,Production_unit,Standard_time,OP_confirm_before"
        )
        .eq("PD_key", pdkey)
        .eq("Production_unit", lineunit);
      if (!error) {
        await setDataShow(Production_history);
        await appcontext.setAppstate(Production_history);
        // await console.log("Set Appcontext Success", Production_history?.[0]);
      } else {
        console.log("fetchData Error  !!!", error);
      }
    };
    fetchdata_qty();

    const fetchdataManpower = async () => {
      let { data: Manpower_record, error } = await supabase
        .from("Manpower_record")
        .select("emp_no")
        .eq("PD_key", pdkey);
      if (!error) {
        setDataManpower(Manpower_record?.map((resd: any) => resd.emp_no));
      } else {
        console.log("fetchdataManpower", error);
      }
    };
    fetchdataManpower();

    setLoading(false);
  }, [pdkey]);

  const [fgShow, setFgShow] = useState<number>(0);
  const [ngShow, setNgShow] = useState<number>(0);
  const [open_qtyShow, setOpen_qtyShow] = useState<number>(0);
  const [fgPercen, setFgPercen] = useState<number>(0);
  const [ngPercen, setNgPercen] = useState<number>(0);

  useEffect(() => {
    const CelculateSet = async () => {
      await setFgShow(dataShow[0]?.OK_qty);
      await setNgShow(dataShow[0]?.NG_qty);
      await setOpen_qtyShow(dataShow[0]?.Open_qty);
    };
    if (dataShow) {
      CelculateSet();
    }
  }, [dataShow]);

  useEffect(() => {
    if (open_qtyShow) {
      setFgPercen((fgShow / open_qtyShow) * 100);
      setNgPercen((ngShow / open_qtyShow) * 100);
    }
    if (pdstatus == "Offline") {
      setFgPercen(0);
      setNgPercen(0);
    }
  }, [fgShow, ngShow, pdstatus, lineunit]);

  return (
    <div>
      <div className="Distanct">
        FG : {fgShow} / {open_qtyShow} ({fgPercen.toFixed(0)} %)
      </div>
      <div className="Distanct">
        NG : {ngShow} / {open_qtyShow} ({ngPercen.toFixed(0)} %)
      </div>
      <div className="Distanct">Leader : {dataUserID}</div>
      <div className="Distanct" key={dataManpower}>
        Satff : {dataManpower[0]} &nbsp;{dataManpower[1]}&nbsp;{dataManpower[2]}
        &nbsp;{dataManpower[3]}&nbsp;{dataManpower[4]}
      </div>
    </div>
  );
};
