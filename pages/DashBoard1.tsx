import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import supabase from "../component_config/supabase";
import { ShowPerformance } from "../component/ShowPerformance";
import { ShowProgress } from "../component/ShowProgress";
import { ShowProgressWork } from "../component/ShowProgressWork";
import { ShowDowntime } from "../component/ShowDowntime";
import { ShowOEE } from "../component/ShowOEE";
import { ShowWO } from "../component/ShowWO";
import { ShowDTRealTime } from "../component/ShowDTRealTime";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import { Typography } from "@mui/material";
import LanguageSharpIcon from "@mui/icons-material/LanguageSharp";
import { useTranslation } from "react-i18next";

export default function ShowDashBoard1() {
  //========= language =====================================
  const { t, i18n } = useTranslation(); //language
  const [languagesUP, setLanguagesUP] = useState<any>("en");
  const [language, setLanguage] = useState<null | HTMLElement>(null);
  const handleMenulanguage = (event: React.MouseEvent<HTMLElement>) => {
    setLanguage(event.currentTarget);
  };
  //---------------------------------------------------------
  const [ShowUnit, SetShowUnit] = useState<any>("");
  const [loadings, setLoadings] = useState(false);
  // const [lineunit, setLineunit] = useState<string>("AHPB-01");
  const [unitgroup, setUnitgroup] = useState<any>([]);
  const [dataLineFilter, setDataLineFilter] = useState<any>([]);
  const [detailLineUnitgroup, setDetailLineUnitGroup] = useState<any>("Group");
  const [detailLine, setDetailLine] = useState<any>("Line");
  // console.log({ detailLine });

  // console.log("unitgroup", unitgroup);
  // console.log("dataLineFilter", dataLineFilter);

  //================== ขยายเต็มจอ =================================
  useEffect(() => {
    document.addEventListener("dblclick", (e) => {
      document.documentElement.requestFullscreen().catch((e) => {});
    });
  }, []);
  //--------------------------------------------------------------
  // Data Line

  const ProductionUnitGroup = supabase
    .channel("custom-pdunit-channelcheckUnitGroupLine")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "Production_unit_group",
        filter: "PD_line=eq." + detailLine,
      },
      (payload) => {
        console.log("custom-pdunit-channelasde", payload);

        fetchShowUnit();
      }
    )
    .subscribe();

  const fetchShowUnit = async () => {
    const { data, error } = await supabase.rpc("showline", {
      prounit: detailLine,
    });
    if (!error) {
      SetShowUnit(data);
    }
  };

  useEffect(() => {
    const fetchShowUnit = async () => {
      const { data, error } = await supabase.rpc("showline", {
        prounit: detailLine,
      });
      if (!error) {
        SetShowUnit(data);
        // console.log("fetch Success ", data);
      }
    };
    fetchShowUnit();
    setLoadings(false);

    const fetchdataGroupName = async () => {
      let { data: Production_unit_group, error } = await supabase
        .from("Production_unit_group")
        .select("Group_name,PD_line");
      if (Production_unit_group) {
        const mapdataUnitGroup = await Production_unit_group.map(
          (rresr: any) => rresr.Group_name
        );
        let unique = await [...new Set(mapdataUnitGroup)];
        // console.log({ unique });

        await setUnitgroup(unique);
        await setDataLineFilter(Production_unit_group);
      }
    };
    fetchdataGroupName();
  }, [detailLine]);
  // End Data Line
  // ==============จุด dropDown =======================================

  const ITEM_HEIGHT: any = 48;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  //-----------------------------------------------------------
  if (loadings) {
    return <div>Loading .... </div>;
  }

  return (
    <div>
      <style jsx global>{`
        body {
          font-size: 16px;
          margin: 0px;
          background-color: #093989;
          background-image: url("/grid.png");
          background-image: linear-gradient(
              to bottom,
              rgba(9, 57, 137, 0.95) 10%,
              rgba(9, 57, 137, 0.95) 80%
            ),
            url("/grid.png");
        }
        .HeaderCompany {
          text-align: center;
          background-color: rgb(49, 49, 49, 0.8);
          padding: 0px;
          padding-bottom: 1px;
          margin-bottom: 2px;
        }
        .Graph {
          margin-left: auto;
          margin-right: auto;
          position: top;
        }
        .Machine {
          font-size: 15px;
          border-radius: 10px;
          padding: 10px;
          font-weight: Bold;
          text-align: left;
          color: #fff;
          background-color: rgb(49, 49, 49, 0.5);
          position: relative;
        }
        .BgGraph {
          border-radius: 5px;
          padding: 10px;
          font-weight: Bold;
          text-align: center;
          margin: 5px;
          color: #fff;
          background-color: rgb(49, 49, 49, 0.15);
          position: relative;
        }
        .Offline {
          border-radius: 5px;
          padding: 2px;
          margin-top: 0px;
          font-weight: Bold;
          color: #000;
          text-align: center;
          background-color: #dddddd;
          position: relative;
        }
        .Online {
          border-radius: 5px;
          padding: 2px;
          margin-top: 0px;
          font-weight: Bold;
          color: #fff;
          text-align: center;
          background-color: #15a401;
          position: relative;
        }
        .Downtime {
          border-radius: 5px;
          padding: 2px;
          margin-top: 0px;
          font-weight: Bold;
          color: #fff;
          text-align: center;
          background-color: #ff0000;
          position: relative;
        }
        .Distanct {
          text-align: left;
          padding: 0.5px;
          padding-left: 1px;
          color: #fff;
        }
        .FootDetail {
          height: 0px;
        }
        .FootDowntime {
          padding-bottom: 0px;
        }
        .NameGauge {
          text-align: center;
          color: #ffffff;
          font-size: 20px;
          font-weight: bold;
        }
        .NameGroup {
          width: 33%;
          float: left;
          color: #ffffff;
          padding-left: 10px;
          text-align: left;
          display: inline;
        }
        .NameUnit {
          width: 33%;
          color: #ffffff;
          float: left;
          text-align: center;
          display: inline;
        }
      `}</style>
      <div
        className={`${ShowUnit[0]?.pdstatus}`}
        style={{ height: 54, fontSize: 36, borderRadius: 0, paddingTop: 6 }}
      >
        <div className="NameGroup">{t(detailLineUnitgroup)}</div>
        <div className="NameUnit">
          {t(detailLine)}
          <IconButton
            aria-label="more"
            id="long-button"
            aria-controls={open ? "long-menu" : undefined}
            aria-expanded={open ? "true" : undefined}
            aria-haspopup="true"
            onClick={handleClick}
            sx={{ textAlign: "center" }}
          >
            <MoreVertIcon sx={{ color: "#FFFAF0" }} />
          </IconButton>
          <Menu
            id="long-menu"
            MenuListProps={{
              "aria-labelledby": "long-button",
            }}
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            PaperProps={{
              style: {
                maxHeight: ITEM_HEIGHT * 4.5,
                width: "20ch",
              },
            }}
          >
            <FormControl sx={{ m: 1, minWidth: 150 }}>
              <InputLabel id="demo-dialog-select-label">Unit Group</InputLabel>
              <Select
                label="Unit Group"
                fullWidth
                value={detailLineUnitgroup}
                onChange={(event) => setDetailLineUnitGroup(event.target.value)}
              >
                <MenuItem value="Group">
                  <em>None</em>
                </MenuItem>
                {unitgroup.map((option: any) => (
                  <MenuItem
                    key={option}
                    value={option}
                    // selected={option === "Pyxis"}
                  >
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ m: 1, minWidth: 150 }}>
              <InputLabel htmlFor="grouped-select">Line</InputLabel>
              <Select
                value={detailLine}
                id="grouped-select"
                label="Line"
                onChange={(event: any) => setDetailLine(event.target.value)}
              >
                <MenuItem value="Line">
                  <em>None</em>
                </MenuItem>
                {dataLineFilter
                  .filter(
                    (option01: any) =>
                      option01.Group_name == detailLineUnitgroup
                  )
                  .map((filtermap: any) => (
                    <MenuItem key={filtermap.PD_line} value={filtermap.PD_line}>
                      {filtermap.PD_line}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Menu>
        </div>
        <div>
          <Typography sx={{ textAlign: "right", color: "white" }}>
            {languagesUP.toUpperCase()}
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenulanguage}
              color="inherit"
            >
              <LanguageSharpIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={language}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(language)}
              onClose={(e) => setLanguage(null)}
            >
              <MenuItem
                onClick={(e) => {
                  i18n.changeLanguage("th");
                  setLanguagesUP("th");
                  setLanguage(null);
                }}
              >
                TH
              </MenuItem>
              <MenuItem
                onClick={(e) => {
                  i18n.changeLanguage("en");
                  setLanguagesUP("en");
                  setLanguage(null);
                }}
              >
                EN
              </MenuItem>
              <MenuItem
                onClick={(e) => {
                  i18n.changeLanguage("cn");
                  setLanguagesUP("cn");
                  setLanguage(null);
                }}
              >
                CN
              </MenuItem>
              <MenuItem
                onClick={(e) => {
                  i18n.changeLanguage("vn");
                  setLanguagesUP("vn");
                  setLanguage(null);
                }}
              >
                VN
              </MenuItem>
            </Menu>
          </Typography>
        </div>
      </div>
      <Grid
        container
        rowSpacing={0}
        columnSpacing={0}
        paddingTop={0.5}
        paddingLeft={2}
      >
        <Grid item xs={7}>
          <Grid container spacing={1} item lg={12} md={12} xs={12}>
            <Grid item xs={6}>
              <div className={"Machine"}>
                <div className="Distanct">
                  {t("WorkOrder")} : {ShowUnit[0]?.woid}
                </div>
                <div className="Distanct">
                  {t("Item")} : {ShowUnit[0]?.itemnumber}
                </div>
                <ShowProgressWork
                  pdkey={String(ShowUnit[0]?.pdkey)}
                  pdstatus={String(ShowUnit[0]?.pdstatus)}
                  detailLine={String(detailLine)}
                  languagesUP={String(languagesUP)}
                />
              </div>
            </Grid>
            <Grid item xs={6}>
              <ShowProgress
                pdkey={String(ShowUnit[0]?.pdkey)}
                pdstatus={String(ShowUnit[0]?.pdstatus)}
                detailLine={String(detailLine)}
                languagesUP={String(languagesUP)}
              />
            </Grid>
            <Grid item xs={6}>
              <ShowPerformance
                pdkey={String(ShowUnit[0]?.pdkey)}
                pdstatus={String(ShowUnit[0]?.pdstatus)}
                detailLine={String(detailLine)}
                languagesUP={String(languagesUP)}
              />
            </Grid>
            <Grid item xs={6}>
              <ShowOEE
                pdkey={String(ShowUnit[0]?.pdkey)}
                pdstatus={String(ShowUnit[0]?.pdstatus)}
                detailLine={String(detailLine)}
                languagesUP={String(languagesUP)}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={5}>
          <Grid item xs={12}>
            <Grid>
              <ShowDTRealTime
                pdkey={String(ShowUnit[0]?.pdkey)}
                pdstatus={String(ShowUnit[0]?.pdstatus)}
                detailLine={String(detailLine)}
                languagesUP={String(languagesUP)}
              />
              <div className={"BgGraph"}>
                <ShowDowntime
                  detailLine={String(detailLine)}
                  languagesUP={String(languagesUP)}
                />
              </div>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <div className={"Machine"}>
            <div className={`${ShowUnit[0]?.pdstatus}`}>
              {t("HistoryWorkToday")}
            </div>
            <ShowWO
              detailLine={String(detailLine)}
              languagesUP={String(languagesUP)}
            />
          </div>
        </Grid>
      </Grid>
    </div>
  );
}
