import React, { useCallback, useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import MoveJsonToExcel from "./module/pages/fileUpload";

const JSONtoEXCEL = (e) => {
  const [sourcesheets, setsourcesheets] = useState();
  const [jsonData, setjsonData] = useState({});
  const [modifiedJsonData, setModifiedJsonData] = useState({});
  const [excelFile, setExcelFile] = useState(null);
  const [keys, setKeys] = useState({});

  console.log(modifiedJsonData, "modifiedJsonData");
  console.log(jsonData, "jsonData");
  console.log(keys, "keyskeys");

  // useEffect(() => {
  //   if (Object.keys(jsonData).length > 0) {
  //     const worksheet = XLSX.utils.json_to_sheet(jsonData);

  //     // Create workbook and add worksheet
  //     const workbook = XLSX.utils.book_new();
  //     XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  //     // Generate Excel file and download
  //     XLSX.writeFile(workbook, "data.xlsx");
  //   }
  // }, [jsonData]);

  // function get_name(name, lis) {
  //   let aa = [];
  //   for (let li of lis) {
  //     let temp = li.match(new RegExp(name + "*"));
  //     if (temp) {
  //       aa.push(temp);
  //     }
  //   }
  //   if (aa.length) {
  //     name = name + (aa.length < 9 ? " 0" : " ") + (aa.length + 1);
  //   }
  //   return name;
  // }

  // function get_sec_name(name, out_dic) {
  //   let values = [];
  //   for (let val_dic of Object.values(out_dic)) {
  //     values.push(...Object.keys(val_dic));
  //   }
  //   return get_name(name, values);
  // }

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

  // function get_dict(name, in_dic, out_dic) {
  //   name = get_name(name, Object.keys(out_dic));
  //   if (
  //     typeof in_dic === "string" ||
  //     typeof in_dic === "number" ||
  //     typeof in_dic === null ||
  //     typeof in_dic === undefined
  //   ) {
  //     let key1 = get_sec_name("NativeType", out_dic);
  //     if (out_dic[name]) {
  //       out_dic[name][key1] = in_dic;
  //     } else {
  //       out_dic[name] = { [key1]: in_dic };
  //     }
  //   } else {
  //     for (let [key, value] of Object.entries(in_dic)) {
  //       if (Array.isArray(value)) {
  //         for (let dic of value) {
  //           if (Array.isArray(dic)) {
  //             out_dic = get_dict(key, dic, out_dic);
  //           } else if (typeof dic === "object") {
  //             out_dic = get_dict(key, dic, out_dic);
  //           } else if (typeof dic === "string") {
  //             key = get_sec_name(key, out_dic);
  //             out_dic = get_dict(key, dic, out_dic);
  //           }
  //         }
  //       } else if (
  //         typeof value === "object" &&
  //         value !== null &&
  //         value !== undefined
  //       ) {
  //         out_dic = get_dict(key, value, out_dic);
  //       } else if (
  //         typeof value === "string" ||
  //         typeof value === "number" ||
  //         typeof value === null ||
  //         typeof value === undefined
  //       ) {
  //         key = get_sec_name(key, out_dic);
  //         if (out_dic[name]) {
  //           out_dic[name][key] = value;
  //         } else {
  //           out_dic[name] = { [key]: value };
  //         }
  //       }
  //     }
  //   }
  //   return out_dic;
  // }

  // function get_dict(name, in_dic, out_dic) {
  //   name = getName(name);
  //   if (
  //     typeof in_dic == "string" ||
  //     typeof in_dic == "number" ||
  //     in_dic == null ||
  //     in_dic == undefined
  //   ) {
  //     let key1 = getName("NativeType");
  //     if (out_dic[name]) {
  //       out_dic[name][key1] = in_dic;
  //     } else {
  //       out_dic[name] = { [key1]: in_dic };
  //     }
  //   } else {
  //     for (let [key, value] of Object.entries(in_dic)) {
  //       if (Array.isArray(value)) {
  //         for (let dic of value) {
  //           if (Array.isArray(dic)) {
  //             out_dic = get_dict(key, dic, out_dic);
  //           } else if (typeof dic === "object") {
  //             out_dic = get_dict(key, dic, out_dic);
  //           } else if (typeof dic === "string") {
  //             key = getName(key);
  //             out_dic = get_dict(key, dic, out_dic);
  //           }
  //         }
  //       } else if (
  //         typeof value === "object" &&
  //         value !== null &&
  //         value !== undefined
  //       ) {
  //         out_dic = get_dict(key, value, out_dic);
  //       } else if (
  //         typeof value == "string" ||
  //         typeof value == "number" ||
  //         value == null ||
  //         value == undefined
  //       ) {
  //         key = getName(key);
  //         if (out_dic[name]) {
  //           out_dic[name][key] = value;
  //         } else {
  //           out_dic[name] = { [key]: value };
  //         }
  //       }
  //     }
  //   }
  //   return out_dic;
  // }

  const handleJSON = (name, data, out_dic, column) => {
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
            out_dic = handleJSON(
              key,
              item,
              out_dic
            );
          }
        } else if (
          typeof value === "object" &&
          value !== null &&
          value !== undefined
        ) {
          out_dic = handleJSON(
            key,
            value,
            out_dic
          );
        }
      }
    }

    return out_dic;
  };

  const handleJsonFileChange = (e) => {
    const file = e.target.files[0];
    setjsonData(file);
    const reader = new FileReader();
    reader.onload = () => {
      const data = JSON.parse(reader.result);
      console.log(data, "datadata");
      let MODIFIED = handleJSON("Root", data, {});
      setModifiedJsonData(MODIFIED);
    };
    reader.readAsText(file);
  };

  const handleExcelFileChange = (e) => {
    const file = e.target.files[0];
    setExcelFile(file);
  };

  const handleUpload = (event) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      setsourcesheets(workbook.SheetNames);

      for (let sheetname in modifiedJsonData) {
        const worksheet =
          workbook.Sheets[`(REQ)_${sheetname}` || `(RESP_200)_${sheetname}`];

        // Get the current highest row number in the sheet
        const currentHighestRow =
          worksheet && worksheet["!ref"].split(":")[1].replace(/\D/g, "");

        // Insert a new row after the current highest row
        const newRowNumber = parseInt(currentHighestRow) + 1;
        const newRowRef = `A${newRowNumber}:Z${newRowNumber}`;
        XLSX.utils.sheet_add_aoa(worksheet, [[""]], {
          origin: newRowRef,
        });

        const headerRow = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[4];
        const jsonKeys = Object.keys(modifiedJsonData[sheetname]);

        jsonKeys.forEach((key) => {
          const columnIndex = headerRow?.findIndex((header) => header == key);
          // if (columnIndex !== -1) {
          // Write the value of the key in the corresponding cell of the 5th row
          const cellAddress = XLSX.utils.encode_cell({
            r: newRowNumber - 1,
            c: columnIndex,
          });
          worksheet[cellAddress] = {
            v: modifiedJsonData[sheetname][key] ?? "A",
          };
          // }
        });
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
        style={{ display: "flex", justifyContent: "center", marginTop: "4rem" }}
      >
        <input type="file" onChange={handleJsonFileChange} />

        <input type="file" onChange={handleExcelFileChange} accept=".xlsx" />
      </div>

      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "4rem" }}
      >
        <button
          disabled={!(modifiedJsonData && excelFile)}
          onClick={handleUpload}
        >
          Upload
        </button>
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
