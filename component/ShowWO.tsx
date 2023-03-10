import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import supabase from "../component_config/supabase";
import { useTranslation } from "react-i18next";

export const ShowWO = (props: { detailLine: String; languagesUP: string }) => {
  const mounted = useRef(false);
  const [GetWoLine, SetWoLine] = useState<any>([]);
  // console.log({ GetWoLine });
  const { detailLine, languagesUP } = props;

  const Today = new Date().toISOString().slice(0, 10);
  const { t, i18n } = useTranslation(); //language
  const [lineunit, setLineunit] = useState<String>("");

  useEffect(() => {
    if (detailLine) {
      setLineunit(detailLine);
    }
  }, [detailLine]);

  const ProductionHistory = supabase
    .channel("custom-filter-channelWorkOrderUpDate")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "Production_history",
        filter: "Production_unit=eq." + lineunit,
      },
      (payload) => {
        console.log("Change received!", payload);
        // SetWoLine((pre: any) => [...pre, payload.new]);
        fetchReload();
      }
    )
    .subscribe();

  const fetchReload = async () => {
    const { data, error } = await supabase
      .from("Production_history")
      .select(
        "PD_key,Work_order_id,Item_number,Availability_percent,Performance_percent,Quality_percent,OEE_percent"
      )
      .eq("Production_unit", lineunit)
      .eq("Production_date", Today)
      .order("Begin_time");
    if (!error) {
      SetWoLine(data);
    }
  };

  useEffect(() => {
    mounted.current = true;
    const fetchWoLine = async () => {
      const { data, error } = await supabase
        .from("Production_history")
        .select(
          "PD_key,Work_order_id,Item_number,Availability_percent,Performance_percent,Quality_percent,OEE_percent,Standard_time"
        )
        .eq("Production_unit", lineunit)
        .eq("Production_date", Today)
        .order("Begin_time");
      if (!error) {
        SetWoLine(data);
      }
    };
    fetchWoLine();
    return () => {
      mounted.current = false;
    };
  }, [lineunit]);

  return (
    <>
      <TableContainer component={Paper}>
        <Table
          sx={{ minWidth: 400, backgroundColor: "#313131", color: "#FFFFFF" }}
          aria-label="simple table"
        >
          <TableHead>
            <TableRow>
              <TableCell style={{ color: "#FFFFFF" }}>
                {t("WorkOrder")}
              </TableCell>
              <TableCell style={{ color: "#FFFFFF" }}>
                {t("ItemNumber")}
              </TableCell>
              <TableCell style={{ color: "#FFFFFF" }} align="right">
                {t("Availability")}
              </TableCell>
              <TableCell style={{ color: "#FFFFFF" }} align="right">
                {t("Performance")}
              </TableCell>
              <TableCell style={{ color: "#FFFFFF" }} align="right">
                {t("Quality")}
              </TableCell>
              <TableCell style={{ color: "#FFFFFF" }} align="right">
                {t("OEE")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {GetWoLine.map((row: any) => (
              <TableRow
                key={row.PD_key}
                sx={{
                  "&:last-child td, &:last-child th": { border: 0 },
                  color: "#FFFFFF",
                }}
              >
                <TableCell
                  style={{ color: "#FFFFFF" }}
                  component="th"
                  scope="row"
                >
                  {row.Work_order_id}
                </TableCell>
                <TableCell style={{ color: "#FFFFFF" }}>
                  {row.Item_number}
                </TableCell>
                <TableCell style={{ color: "#FFFFFF" }} align="right">
                  {(row.Availability_percent * 100).toFixed(2)}%
                </TableCell>
                <TableCell style={{ color: "#FFFFFF" }} align="right">
                  {(row.Performance_percent * 100).toFixed(2)}%
                </TableCell>
                <TableCell style={{ color: "#FFFFFF" }} align="right">
                  {(row.Quality_percent * 100).toFixed(2)}%
                </TableCell>
                <TableCell style={{ color: "#FFFFFF" }} align="right">
                  {(row.OEE_percent * 100).toFixed(2)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};
