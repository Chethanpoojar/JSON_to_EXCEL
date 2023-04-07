import React, { useCallback, useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import MoveJsonToExcel from "./module/pages/fileUpload";
import { FormLabel, Grid } from "@mui/material";
import xml2js from "xml2js";

const JSONtoEXCEL = (e) => {
  const [sourcesheets, setsourcesheets] = useState();
  const [jsonData, setjsonData] = useState({ req: "", resp: "" });
  const [modifiedJsonData, setModifiedJsonData] = useState({});
  const [excelFile, setExcelFile] = useState(null);
  const [keys, setKeys] = useState({});
  const [version, setversion] = useState("2");

  console.log(modifiedJsonData, "modifiedJsonData");
  console.log(jsonData, "jsonDatajsonData");
  console.log(keys, "keyskeys");

  //getting a dynamic name for duplicate names
  const getName = (name) => {
    let KEYS = keys;
    if (KEYS[name]) {
      KEYS[name] = KEYS[name] + 1;
      setKeys(KEYS);
      return name + (KEYS[name] <= 9 ? " 0" : " ") + KEYS[name];
    } else {
      KEYS[name] = 1;
      setKeys(KEYS);
      return name;
    }
  };

  //modifying xml or json request or response to match with TE 3.x template headers
  const handleTE3JSON = (name, data, out_dic, column) => {
    name = getName(name);
    if (
      typeof data == "string" ||
      Number.isInteger(data) ||
      typeof data == "boolean" ||
      data == null ||
      data == undefined
    ) {
      let key1 = getName(column ?? "NativeType");
      if (out_dic[name]) {
        out_dic[name][key1] = data;
      } else {
        out_dic[name] = { [key1]: data };
      }
    } else {
      for (let [key, value] of Object.entries(data)) {
        if (
          typeof value == "string" ||
          Number.isInteger(value) ||
          typeof value == "boolean" ||
          value == null ||
          value == undefined
        ) {
          let key1 = getName(key);
          if (out_dic[name]) {
            out_dic[name][key1] = value;
          } else {
            out_dic[name] = { [key1]: value };
          }
        } else if (Array.isArray(value)) {
          for (let item of value) {
            out_dic = handleTE3JSON(key, item, out_dic);
          }
        } else if (
          typeof value === "object" &&
          value !== null &&
          value !== undefined
        ) {
          out_dic = handleTE3JSON(key, value, out_dic);
        }
      }
    }

    return out_dic;
  };

  //modifying xml or json request or response to match with TE 2.x template headers
  const handleTe2JSON = (sheet, data, out_dic) => {
    if (
      typeof data == "string" ||
      Number.isInteger(data) ||
      typeof data == "boolean" ||
      data == null ||
      data == undefined
    ) {
      let column = getName("NativeType");

      if (out_dic[sheet]) {
        out_dic[sheet][column] = data;
      } else {
        out_dic[sheet] = { [column]: data };
      }
    } else {
      // name = getName(name);
      for (let [key, value] of Object.entries(data)) {
        if (
          typeof value == "string" ||
          Number.isInteger(value) ||
          typeof value == "boolean" ||
          value == null ||
          value == undefined
        ) {
          let column = getName(key);

          if (out_dic[sheet]) {
            out_dic[sheet][column] = value;
          } else {
            out_dic[sheet] = { [column]: value };
          }
        } else if (Array.isArray(value)) {
          let SHEET = getName(key);
          for (let item of value) {
            out_dic = handleTe2JSON(SHEET, item, out_dic);
          }
        } else if (
          typeof value === "object" &&
          value !== null &&
          value !== undefined
        ) {
          let SHEET = getName(key);
          out_dic = handleTe2JSON(SHEET, value, out_dic);
        }
      }
    }

    return out_dic;
  };

  //uploading json or xml request file
  const handleReqJsonFileChange = (e) => {
    let file = e.target.files[0];

    if (file.type === "application/json") {
      setjsonData(file);
      const reader = new FileReader();

      reader.onload = () => {
        const data = JSON.parse(reader.result);
        let MODIFIED =
          version === "2"
            ? handleTe2JSON("Root", data, {})
            : version === "3" && handleTE3JSON("Root", data, {});
        setModifiedJsonData({ ...modifiedJsonData, req: MODIFIED });
      };
      reader.readAsText(file);
    } else if (file.type === "text/xml") {
      setjsonData(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        const xml = event.target.result;
        const JSON = xmlToJsonConvert(xml);
        console.log(JSON, "JSONJSONJSON");
        let MODIFIED_JSON =
          version === "2"
            ? handleTe2JSON("Root", JSON, {})
            : version === "3" && handleTE3JSON("Root", JSON, {});
        setModifiedJsonData({ ...modifiedJsonData, req: MODIFIED_JSON });
      };
      reader.readAsText(file);
    } else {
      window.alert("Unsupported file type");
      // file = "";
    }
  };

  //uploading json or xml response file
  const handleRespJsonFileChange = (e) => {
    const file = e.target.files[0];

    if (file.type === "application/json") {
      setjsonData(file);
      const reader = new FileReader();
      reader.onload = () => {
        const data = JSON.parse(reader.result);
        let MODIFIED = handleTE3JSON("Root", data, {});
        setModifiedJsonData({ ...modifiedJsonData, resp: MODIFIED });
      };
      reader.readAsText(file);
    } else if (file.type === "text/xml") {
      setjsonData(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const xml = event.target.result;
        const JSON = xmlToJsonConvert(xml);
        console.log(JSON, "JSONJSONJSON");
        let MODIFIED_JSON =
          version === "2"
            ? handleTe2JSON("Root", JSON, {})
            : version === "3" && handleTE3JSON("Root", JSON, {});
        setModifiedJsonData({ ...modifiedJsonData, req: MODIFIED_JSON });
      };
      reader.readAsText(file);
    }
  };

  //converting xml request or response to json to match with template
  const xmlToJsonConvert = (xml) => {
    console.log(xml, "xmlxmlxml");
    const parser = new xml2js.Parser({ explicitArray: false });
    let json = {};
    parser.parseString(xml, (err, result) => {
      if (err) {
        console.error(err);
      } else {
        console.log(JSON.stringify(result, null, 2), "resultJSON");
        json = result;
      }
    });

    return json;
  };

  //uploading TE template
  const handleExcelFileChange = (e) => {
    const file = e.target.files[0];
    setExcelFile(file);
  };

  //comparing request or response with template and filling the value in excel
  const handleUpload = (event) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      // setsourcesheets(workbook.SheetNames);

      if (modifiedJsonData?.req) {
        for (let sheetname in modifiedJsonData?.req) {
          let worksheet = workbook.Sheets[`(REQ)_${sheetname}`];

          if (!worksheet) {
            // handle the case where the worksheet does not exist
            console.error(
              `Worksheet '(REQ)_${sheetname}' not found in workbook`
            );
            continue;
          }

          // Get the current highest row number in the sheet
          const currentHighestRow =
            worksheet && worksheet["!ref"].split(":")[1].replace(/\D/g, "");

          // Insert a new row after the current highest row
          const newRowNumber = parseInt(currentHighestRow) + 1;
          const newRowRef = `A${newRowNumber}:Z${newRowNumber}`;
          XLSX.utils.sheet_add_aoa(worksheet, [[""]], {
            origin: newRowRef,
          });

          const headerRow = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
          })[4];
          const jsonKeys = Object.keys(modifiedJsonData?.req[sheetname]);

          jsonKeys.forEach((key) => {
            const columnIndex = headerRow?.findIndex((header) => header == key);
            // if (columnIndex !== -1) {
            // Write the value of the key in the corresponding cell of the 5th row
            const cellAddress = XLSX.utils.encode_cell({
              r: newRowNumber - 1,
              c: columnIndex,
            });
            worksheet[cellAddress] = {
              v: modifiedJsonData?.req[sheetname][key] ?? "A",
              // };
            };
          });
        }
      }

      if (modifiedJsonData?.resp) {
        for (let sheetname in modifiedJsonData?.resp) {
          let worksheet = workbook.Sheets[`(RESP_200)_${sheetname}`];

          if (!worksheet) {
            // handle the case where the worksheet does not exist
            console.error(
              `Worksheet '(RESP_200)_${sheetname}' not found in workbook`
            );
            continue;
          }

          // Get the current highest row number in the sheet
          const currentHighestRow =
            worksheet && worksheet["!ref"].split(":")[1].replace(/\D/g, "");

          // Insert a new row after the current highest row
          const newRowNumber = parseInt(currentHighestRow) + 1;
          const newRowRef = `A${newRowNumber}:Z${newRowNumber}`;
          XLSX.utils.sheet_add_aoa(worksheet, [[""]], {
            origin: newRowRef,
          });

          const headerRow = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
          })[4];
          const jsonKeys = Object.keys(modifiedJsonData?.resp[sheetname]);

          jsonKeys.forEach((key) => {
            const columnIndex = headerRow?.findIndex((header) => header == key);
            if (columnIndex !== -1) {
              // Write the value of the key in the corresponding cell of the 5th row
              const cellAddress = XLSX.utils.encode_cell({
                r: newRowNumber - 1,
                c: columnIndex,
              });
              worksheet[cellAddress] = {
                v: modifiedJsonData?.resp[sheetname][key] ?? "A",
              };
            }
          });
        }
      }

      const outputData = XLSX.write(workbook, {
        type: "binary",
        bookType: "xlsx",
      });
      const blob = new Blob([s2ab(outputData)], {
        type: "application/octet-stream",
      });
      saveAs(blob, excelFile.name);
    };

    reader.readAsBinaryString(excelFile);
  };

  const s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  };

  return (
    <>
      <div
        style={{
          marginTop: "4rem",
        }}
      >
        <Grid container>
          <Grid item xs={6} container justifyContent="flex-end">
            <FormLabel>TE Version : </FormLabel>{" "}
            <select
              style={{ width: "6rem", marginRight: "5rem" }}
              onChange={(e) => setversion(e.target.value)}
            >
              <option value="2">2.x</option>
              <option value="3">3.x</option>
            </select>
          </Grid>

          <Grid item xs={6}>
            <FormLabel> Excel Template :</FormLabel>

            <input
              type="file"
              onChange={handleExcelFileChange}
              accept=".xlsx"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3} marginTop="3rem">
          <Grid item xs={6} container justifyContent="flex-end">
            <FormLabel> Request : </FormLabel>
            <input type="file" onChange={handleReqJsonFileChange} />
          </Grid>

          <Grid item xs={6}>
            {" "}
            <FormLabel>Response : </FormLabel>{" "}
            <input type="file" onChange={handleRespJsonFileChange} />
          </Grid>
        </Grid>

        <Grid container marginTop="3rem" justifyContent="center">
          <button
            disabled={
              !((modifiedJsonData.req || modifiedJsonData.resp) && excelFile)
            }
            onClick={handleUpload}
          >
            Upload
          </button>
        </Grid>
      </div>

      {/* {sourcesheets?.length > 0 && (
        <div style={{ marginTop: "3rem" }}>
          {" "}
          Sheets :
          <select>
            {sourcesheets.map((val) => {
              return <option value={val}>{val}</option>;
            })}
          </select>
        </div>
      )} */}
    </>
  );
};

export default JSONtoEXCEL;
