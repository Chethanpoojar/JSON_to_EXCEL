import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import MoveJsonToExcel from "./module/pages/fileUpload";

const App = (e) => {
  const [sourcesheets, setsourcesheets] = useState();
  const [jsonData, setjsonData] = useState({});

  console.log(jsonData, "newJsonDatanewJsonData");

  function get_name(name, lis) {
    let aa = [];
    for (let li of lis) {
      let temp = li.match(new RegExp(name + "*"));
      if (temp) {
        aa.push(temp);
      }
    }
    if (aa.length) {
      name = name + (aa.length < 9 ? " 0" : " ") + (aa.length + 1);
    }
    return name;
  }

  function get_sec_name(name, out_dic) {
    let values = [];
    for (let val_dic of Object.values(out_dic)) {
      values.push(...Object.keys(val_dic));
    }
    return get_name(name, values);
  }

  function get_dict(name, in_dic, out_dic) {
    name = get_name(name, Object.keys(out_dic));
    if (
      typeof in_dic === "string" ||
      typeof in_dic === "number" ||
      typeof in_dic === null ||
      typeof in_dic === undefined
    ) {
      let key1 = get_sec_name("NativeType", out_dic);
      if (out_dic[name]) {
        out_dic[name][key1] = in_dic;
      } else {
        out_dic[name] = { [key1]: in_dic };
      }
    } else {
      for (let [key, value] of Object.entries(in_dic)) {
        if (Array.isArray(value)) {
          for (let dic of value) {
            if (Array.isArray(dic)) {
              out_dic = get_dict(key, dic, out_dic);
            } else if (typeof dic === "object") {
              out_dic = get_dict(key, dic, out_dic);
            } else if (typeof dic === "string") {
              key = get_sec_name(key, out_dic);
              out_dic = get_dict(key, dic, out_dic);
            }
          }
        } else if (
          typeof value === "object" &&
          value !== null &&
          value !== undefined
        ) {
          out_dic = get_dict(key, value, out_dic);
        } else if (typeof value === "string") {
          key = get_sec_name(key, out_dic);
          if (out_dic[name]) {
            out_dic[name][key] = value;
          } else {
            out_dic[name] = { [key]: value };
          }
        }
      }
    }
    return out_dic;
  }

  useEffect(() => {
    let aa = get_dict("Root", json, {});
    setjsonData(aa);
  }, []);

  const hadleFileInput = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      const data = e.target.result;
      const wb = XLSX.read(data, { type: "binary" });
      setsourcesheets(wb.SheetNames);

      for (let sheetname in jsonData) {
        const ws = wb.Sheets[`(REQ)_${sheetname}`];
        const range = XLSX.utils.decode_range(ws["!ref"]);
        range.s.r = 4;
        range.e.r = 4;
        const headers = [];
        for (let C = range.s.c; C <= range.e.c; C++) {
          for (let column in jsonData[sheetname]) {
            const cellAddress = XLSX.utils.encode_cell({
              r: range.s.r,
              c: C,
            });
            if (!ws[cellAddress] || !ws[cellAddress].v) continue;
            headers.push(ws[cellAddress].v);
            ws[cellAddress].v = "A";
          }
        }

        console.log(headers, "headers");
      }

      const outputData = XLSX.write(wb, {
        type: "binary",
        bookType: "xlsx",
      });
      const blob = new Blob([s2ab(outputData)], {
        type: "application/octet-stream",
      });
      saveAs(blob, file.name);
    };

    reader.readAsBinaryString(e.target.files[0]);
  };

  const sourceFileInput = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      console.log(workbook.SheetNames, "workbook");
      setsourcesheets(workbook.SheetNames);

      for (let sheetname in jsonData) {
        const worksheet = workbook.Sheets[`(REQ)_${sheetname}`];
        const range = XLSX.utils.decode_range(worksheet["!ref"]);
        range.s.r = 4;
        range.e.r = 4;
        // Iterate through the cells in the first row and extract the column names
        const headers = [];
        for (let C = range.s.c; C <= range.e.c; ++C) {
          for (let column in jsonData[sheetname]) {
            const address = XLSX.utils.encode_cell({ r: range.s.r, c: C });
            let cell = worksheet[address];
            if (!cell || !cell.v) continue;
            headers.push(cell.v);
            const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: C });

            // range.s.r = 5;
            // range.e.r = 5;
            // for (let C = range.s.c; C <= range.e.c; ++C) {
            //   if (cell.v == column) {
            //     const columnIndex = headers.indexOf(cell.v);
            //     const rowIndex = 5;
            //     const cellAddress = XLSX.utils.encode_cell({
            //       r: rowIndex,
            //       c: columnIndex,
            //     });
            //     const cell = worksheet[cellAddress];
            //     if (!cell || !cell.v) continue;
            //     if (worksheet[cellAddress]) {
            //       worksheet[cellAddress].v = jsonData[sheetname][column] ?? "A";
            //     }
            //   }
            // }

            // range.s.r = 5;
            // range.e.r = 5;
            // console.log(cell.v, ":", column, "cell column");
            // for (let C = range.s.c; C <= range.e.c; ++C) {
            //   // if (cell.v == column) {
            //   const address = XLSX.utils.encode_cell({ r: range.s.r, c: C });
            //   let cell = worksheet[address];
            //   if (!cell || !cell.v) continue;
            //   cell.v =  "A";
            //   // }
            // }
          }
        }
        console.log(headers, "headers");
      }

      const outputData = XLSX.write(workbook, {
        type: "binary",
        bookType: "xlsx",
      });
      const blob = new Blob([s2ab(outputData)], {
        type: "application/octet-stream",
      });
      saveAs(blob, file.name);
    };

    reader.readAsBinaryString(event.target.files[0]);
  };

  const s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", margin: "auto" }}>
      <input type="file" onChange={sourceFileInput} accept=".xlsx" />
      {sourcesheets?.length > 0 && (
        <div style={{ marginTop: "3rem" }}>
          {" "}
          Sheets :
          <select>
            {sourcesheets.map((val) => {
              return <option value={val}>{val}</option>;
            })}
          </select>
        </div>
      )}

      {/* <button onClick={""}>Generate JSON</button> */}

      {/* <MoveJsonToExcel /> */}
    </div>
  );
};

export default App;

const json = {
  name: "John Smith",
  age: 30,
  email: "john.smith@example.com",
  hobbies: ["reading", "traveling", "photography"],
};

const json2 = {
  PartnerAccountInquiryReqDTO: {
    searchCriteria: "1",
    maskedAccountNumber: "1382",
    mobileNumber: "9885804000",
  },
  sessionContext: {
    channel: "MB53",
    bankCode: "08",
    userId: "DevUser01",
    externalReferenceNo: "1234565",
    transactionBranch: "089999",
    transactingPartyCode: "9898765645",
  },
};

const JSON_DATA = {
  UserData: "UserData",
  RequestInfo: {
    SolutionSetName: "Go_KOTAK_MAHINDRA_AGSS",
    ExecuteLatestVersion: true,
  },
  Fields: {
    ApplicationData: {
      Services: {
        Service: {
          Skip: "N",
          Operations: {
            Operation: {
              Params: {
                Param: [
                  {
                    Value: "100000",
                    Name: "Amount",
                  },
                  {
                    Value: "true",
                    Name: "CIRHTMLReport",
                  },
                  {
                    Value: "true",
                    Name: "MSMERank",
                  },
                  {
                    Value: "JSON",
                    Name: "ResponseType",
                  },
                  {
                    Value: "03300001",
                    Name: "MemberCode",
                  },
                  {
                    Value: "BP",
                    Name: "MemberKOB",
                  },
                  {
                    Value: "BP03300001_CMMUATC2C",
                    Name: "UserId",
                  },
                  {
                    Value: "y9vpaa@jbyWadjm",
                    Name: "UserPassword",
                  },
                ],
              },
              Name: "CommercialBureau",
            },
          },
          Id: "ComBS",
          GSTStateCode: "07",
          Consent: "true",
        },
      },
    },
    Applicants: {
      Applicant: {
        TIN: "",
        Services: {
          Service: {
            Operations: {
              Operation: {
                Params: {
                  Param: [
                    {
                      Value: "20022020",
                      Name: "DateOfRegistration",
                    },
                    {
                      Value: "MANUFACTURE OF DOMESTIC APPLIANCES",
                      Name: "ClassOfActivity",
                    },
                    {
                      Value: "NOT CLASSIFIED",
                      Name: "TypeOfEntity",
                    },
                    {
                      Value: "11452675",
                      Name: "MemberReferenceNumber",
                    },
                    {
                      Value: "Overdraft",
                      Name: "FacilityCategory",
                    },
                    {
                      Value: "NEW LOAN",
                      Name: "FacilityType",
                    },
                  ],
                },
                Name: "CommercialBureau",
              },
            },
            Id: "ComBS",
          },
        },
        RegisteredAddress: {
          Telephone: {
            TelephoneType: "OFFICE",
            Telephone_Num: "7973124432",
            Contact_Prefix: null,
            Contact_Area: null,
          },
          AddressType: "REGISTERED",
          AddressStateCode: "07",
          AddressPincode: "110037",
          AddressLine3: "Third cross",
          AddressLine2: "Second main",
          AddressLine1: "First line",
          AddressCity: "SOUTH WEST DELHI",
        },
        PAN: "AAACJ9928K",
        OtherAddresses: {
          OtherAddress: [
            {
              Telephone: {
                TelephoneType: "OFFICE",
                Telephone_Num: "7973124432",
                Contact_Prefix: null,
                Contact_Area: null,
              },
              AddressType: "Others",
              AddressStateCode: "07",
              AddressPincode: "110037",
              AddressLine3: "Third cross",
              AddressLine2: "Second main",
              AddressLine1: "First line",
              AddressCity: "SOUTH WEST DELHI",
            },
          ],
        },
        CRN: null,
        CompanyName: "MS JORJY INTERNATIONAL PVT LTD",
        CIN: "",
        ApplicantType: "Company",
      },
    },
  },
  Culture: "en-US",
};

const MODIFIED_JSON = {
  root: {
    UserData: "UserData",
    Culture: "en-US",
  },
  RequestInfo: {
    SolutionSetName: "Go_KOTAK_MAHINDRA_AGSS",
    ExecuteLatestVersion: true,
  },
  Service: {
    Skip: "N",
    Id: "ComBS",
    GSTStateCode: "07",
    Consent: "true",
  },
  Operation: {
    Name09: "CommercialBureau",
  },
  Param: {
    Value: "100000",
    Name: "Amount",
  },
  Param02: {
    Value02: "true",
    Name02: "CIRHTMLReport",
  },
  Param03: {
    Value03: "true",
    Name03: "MSMERank",
  },
  Param04: {
    Value04: "JSON",
    Name04: "ResponseType",
  },
  Param05: {
    Value05: "03300001",
    Name05: "MemberCode",
  },
  Param06: {
    Value06: "BP",
    Name06: "MemberKOB",
  },
  Param07: {
    Value07: "BP03300001_CMMUATC2C",
    Name07: "UserId",
  },
  Param08: {
    Value08: "y9vpaa@jbyWadjm",
    Name08: "UserPassword",
  },
  Param09: {
    Value09: "20022020",
    Name10: "DateOfRegistration",
  },
  Param10: {
    Value10: "MANUFACTURE OF DOMESTIC APPLIANCES",
    Name11: "ClassOfActivity",
  },
  Param11: {
    Value11: "NOT CLASSIFIED",
    Name12: "TypeOfEntity",
  },
  Param12: {
    Value12: "11452675",
    Name13: "MemberReferenceNumber",
  },
  Param13: {
    Value13: "Overdraft",
    Name14: "FacilityCategory",
  },
  Param14: {
    Value14: "NEW LOAN",
    Name15: "FacilityType",
  },
  Applicant: {
    TIN: "",
    PAN: "AAACJ9928K",
    CRN: null,
    CompanyName: "MS JORJY INTERNATIONAL PVT LTD",
    CIN: "",
    ApplicantType: "Company",
  },
  Service02: {
    Id: "ComBS",
  },
  Operation02: {
    Name16: "CommercialBureau",
  },
  RegisteredAddress: {
    AddressType: "REGISTERED",
    AddressStateCode: "07",
    AddressPincode: "110037",
    AddressLine3: "Third cross",
    AddressLine2: "Second main",
    AddressLine1: "First line",
    AddressCity: "SOUTH WEST DELHI",
  },
  Telephone: {
    TelephoneType: "OFFICE",
    Telephone_Num: "7973124432",
    Contact_Prefix: null,
    Contact_Area: null,
  },
  OtherAddress: {
    AddressType02: "Others",
    AddressStateCode02: "07",
    AddressPincode02: "110037",
    AddressLine302: "Third cross",
    AddressLine202: "Second main",
    AddressLine102: "First line",
    AddressCity02: "SOUTH WEST DELHI",
  },
  Telephone02: {
    TelephoneType02: "OFFICE",
    Telephone_Num02: "7973124432",
    Contact_Prefix02: null,
    Contact_Area02: null,
  },
};
