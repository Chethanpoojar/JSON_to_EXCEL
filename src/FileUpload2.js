import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import FileSaver from "file-saver";

const App = (e) => {
  const [sourcesheets, setsourcesheets] = useState();
  const [targetsheets, settargetsheets] = useState([]);
  const [sourcesheetColumns, setsourcesheetColumns] = useState([]);
  const [sourcefileData, setsourcefileData] = useState([]);
  const [targetfileData, settargetfileData] = useState([]);
  const [resultData, setresultData] = useState([]);
  const [column, setcolumn] = useState();

  console.log(targetfileData, "targetfileData");

  useEffect(() => {
    setcolumn(sourcesheetColumns[0]);
  }, [sourcesheetColumns]);

  const targetFileInput = (event) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const data = e.target.result;

      const workbook = XLSX.read(data, { type: "binary" });
      settargetsheets(workbook.SheetNames);
      const sheet = workbook.Sheets[workbook.SheetNames[0]]; // assuming the data is in the first sheet
      const sheetData = XLSX.utils.sheet_to_json(sheet);
      settargetfileData(sheetData);

      console.log(sheetData, "dataqwertyuiuytrewq");
    };
    reader.readAsBinaryString(event.target.files[0]);
  };

  const sourceFileInput = (event) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const data = e.target.result;

      const workbook = XLSX.read(data, { type: "binary" });
      console.log(workbook, "workbook");
      setsourcesheets(workbook.SheetNames);
      const sheet = workbook.Sheets[workbook.SheetNames[0]]; // assuming the data is in the first sheet
      const sheetData = XLSX.utils.sheet_to_json(sheet);
      setsourcesheetColumns(Object.keys(sheetData[0]));
      setsourcefileData(sheetData);

      console.log(sheetData, "dataqwertyuiuytrewq");
      // data now contains the contents of the source file
    };
    reader.readAsBinaryString(event.target.files[0]);
  };

  const handleMove = () => {
    settargetfileData(
      sourcefileData.map((val, i) => ({
        ...val,
        [column]: sourcefileData[i][column],
      }))
    );

    exportToExcel(
      sourcefileData.map((val, i) => ({
        ...val,
        [column]: sourcefileData[i][column],
      }))
    );
  };

  const exportToExcel = (data) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const res = new Blob([excelBuffer], { type: "application/octet-stream" });
    FileSaver.saveAs(res, "data.xlsx");
  };

  return (
    <div>
      <div style={{ display: "flex" }}>
        <div>
          <div style={{width:"50%"}}>
            <input type="file" onChange={sourceFileInput} accept=".xlsx" />
          </div>
          {sourcesheets?.length > 0 && (
            <div>
              Sheets :
              <select>
                {sourcesheets.map((val) => {
                  return <option value={val}>{val}</option>;
                })}
              </select>
            </div>
          )}
        </div>

        <div>
          <div>
            <input type="file" onChange={targetFileInput} accept=".xlsx" />
          </div>

          {targetsheets?.length > 0 && (
            <div>
              Sheets :
              <select>
                {targetsheets.map((val) => {
                  return <option value={val}>{val}</option>;
                })}
              </select>
            </div>
          )}
        </div>
      </div>

      {sourcesheetColumns.length > 0 && targetsheets.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "3rem",
          }}
        >
          <div>
            Columns :
            <select value={column} onChange={(e) => setcolumn(e.target.value)}>
              {sourcesheetColumns.map((val) => {
                return (
                  <option key={val} value={val}>
                    {val}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <button onClick={handleMove}>Move</button>
            {/* <button onClick={exportToExcel}>Export File</button> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
