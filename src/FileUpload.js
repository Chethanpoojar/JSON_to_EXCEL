import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { read, utils, writeFile, WorkBook } from "xlsx";

const FileUpload = (e) => {
  const [sourcesheets, setsourcesheets] = useState();
  const [targetsheets, settargetsheets] = useState([]);
  const [sourcesheetColumns, setsourcesheetColumns] = useState([]);

  console.log(sourcesheets,"sourcesheets");

  useEffect(() => {
    if (sourcesheets) {
      const firstSheet = sourcesheets[Object.keys(sourcesheets)[0]];
      const range = firstSheet["!ref"];
      const [startCell, endCell] = range.split(":");

      const startColumn = startCell.match(/[A-Z]+/)[0];
      const endColumn = endCell.match(/[A-Z]+/)[0];

      function generateColumnRange(startColumn, endColumn) {
        const startNum = columnToNumber(startColumn);
        const endNum = columnToNumber(endColumn);
        const numColumns = endNum - startNum + 1;
        return Array.from({ length: numColumns }, (_, i) =>
          numberToColumn(startNum + i)
        );
      }

      function columnToNumber(column) {
        let number = 0;
        for (let i = 0; i < column.length; i++) {
          number = number * 26 + column.charCodeAt(i) - "A".charCodeAt(0) + 1;
        }
        return number;
      }

      function numberToColumn(number) {
        let column = "";
        while (number > 0) {
          const remainder = number % 26;
          column =
            String.fromCharCode((remainder || 26) + "A".charCodeAt(0) - 1) +
            column;
          number = Math.floor((number - 1) / 26);
        }
        return column;
      }

      const columns = generateColumnRange(startColumn, endColumn);

      setsourcesheetColumns(columns)
      console.log(columns, "columnscolumns");
    }
  }, [sourcesheets]);

  const targetFileInput = (event) => {
    const files = event.target.files;
    if (files.length) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const wb = read(event.target.result);
        const sheets = wb.SheetNames[0];
        settargetsheets(sheets);
        console.log(sheets, "sheets");

        // if (sheets.length) {
        //     const rows = utils.sheet_to_json(wb.Sheets[sheets[0]]);
        //     setMovies(rows)
        // }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const sourceFileInput = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsBinaryString(file);

    reader.onload = () => {
      const binaryString = reader.result;
      const workbook = XLSX.read(binaryString, { type: "binary" });
      console.log(workbook, "workbook");

      const sourceSheet = workbook?.Sheets;
      console.log(sourceSheet,"sourceSheet");
      setsourcesheets(sourceSheet);
    };
  };

  return (
    <div style={{ display: "flex" }}>
      <div>
        <div>
          <input type="file" onChange={sourceFileInput} accept=".xlsx" />
        </div>
        {sourcesheets && Object.keys(sourcesheets)?.length > 0 && (
          <div>
            Sheets :
            <select>
             {Object.keys(sourcesheets).map(val=>{return <option value={val}>{val}</option>}) }
            </select>
          </div>
        )}
        {sourcesheetColumns.length > 0 && (
          <div>
            Columns :
            <select>
             {sourcesheetColumns.map(val=>{return <option value={val}>{val}</option>}) }
            </select>
          </div>
        )}
      </div>

      <div>
        <div>
          <input type="file" onChange={targetFileInput} accept=".xlsx" />
        </div>
        {/* {targetsheets.length > 0 && (
          <div>
            <select>
              <option>{targetsheets[0]}</option>
            </select>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default FileUpload;
