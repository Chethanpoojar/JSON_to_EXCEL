import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function MoveJsonToExcel() {
  const [jsonData, setJsonData] = useState(null);
  const [excelFile, setExcelFile] = useState(null);

  const handleJsonFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const data = JSON.parse(reader.result);
      setJsonData(data);
    };
    reader.readAsText(file);
  };

  const handleExcelFileChange = (e) => {
    const file = e.target.files[0];
    setExcelFile(file);
  };

  const handleUpload = () => {
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      console.log(workbook.SheetNames, "workbook");
      const jsonKeys = Object.keys(jsonData);
      jsonKeys.forEach((key) => {
        const cell = worksheet[key];
        if (cell) {
          cell.v = jsonData[key];
        }
      });
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
    <div>
      <input type="file" onChange={handleJsonFileChange} />
      <input type="file" onChange={handleExcelFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}

export default MoveJsonToExcel;
