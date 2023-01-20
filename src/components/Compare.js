import React, { useState } from "react";
import readXlsxFile from "read-excel-file";

const Compare = () => {
  const [excel1, setExcel1] = useState(null);
  const [excel2, setExcel2] = useState(null);
  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState([]);
  const [mismatch, setMismatch] = useState([]);
  const [mismatchCounter, setMismatchCounter] = useState(0);

  const schema1 = {
    Tenant: { prop: "tenant", type: String },
    Unit: { prop: "unit", type: String },
    Status: { prop: "status", type: String },
    Charge: { prop: "charge", type: String },
    "Date From": { prop: "datefrom", type: Date },
    "Date To": { prop: "dateto", type: Date },
  };
  const schema2 = {
    Tenant: { prop: "tenant", type: String },
    Unit: { prop: "unit", type: String },
    Status: { prop: "status", type: String },
    Property: { prop: "property", type: String },
    "Lease From": { prop: "leasefrom", type: String },
    "Lease To": { prop: "leaseto", type: String },
  };

  const updateExcel1 = (e) => {
    const file = e.target.files[0];
    if (file) {
      setExcel1(file);
      readXlsxFile(file, {
        schema: schema1,
        transformData(data) {
          return data.filter((row, i) => {
            return (i > 2 && row[2] === "Current") || row[2] === "Status";
          });
        },
      }).then((rows) => {
        const newData = rows.rows.map((row) => {
          return row;
        });

        setData1(newData);
      });
    }
  };
  const updateExcel2 = (e) => {
    const file = e.target.files[0];
    if (file) {
      setExcel2(file);
      readXlsxFile(file, {
        schema: schema2,
        transformData(datas2) {
          return datas2.filter((row, i) => {
            return i > 1;
          });
        },
      }).then((rows) => {
        const newData2 = rows.rows.map((row) => {
          return row;
        });
        setData2(newData2);
      });
    }
  };
  function reset() {
    setMismatchCounter(0);
    setMismatch([]);
    setExcel1(null);
    setExcel2(null);
    window.location.reload(false);
  }

  function compareResult() {
    console.log(excel1.name, excel2.name, "jah");
    if (!excel1.name.startsWith("rent")) {
      alert("You selected the wrong document for the first file");
    }
    if (!excel2.name.startsWith("Tenant")) {
      alert("You selected the wrong document for the second file");
    }
    if (excel1 === null || excel2 === null) {
      alert("Please make sure you upload both documents");
    }
    let counter = 0;
    const results = [];
    for (let i = 0; i < data1.length; i++) {
      for (let j = 0; j < data2.length; j++) {
        const date1 = new Date(data1[i].dateto);
        const date2 = new Date(data2[j].leaseto);
        const tenant1 = data1[i].tenant;
        const tenant2 = data2[j].tenant;
        const dateDiff =
          Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24);

        if (tenant1 === tenant2) {
          if (data2[j].leaseto === undefined && data1[i].dateto === undefined) {
            //Do nothing if both lease and scheduled charge date are undefined
          }
          //If lease end date does not exist and scheduled charge date exists, add to result
          if (data2[j].leaseto === undefined && data1[i].dateto !== undefined) {
            results.push({
              tenant: tenant1,
              chargeto: new Date(data1[i].dateto).toLocaleDateString(),
              leaseto: data2[j].leaseto,
              property: data2[j].property,
            });
            counter = counter + 1;
            //If scheduled charge end date and lease end date are greater than 2 days and both exist add to result
          } else {
            if (dateDiff > 2) {
              results.push({
                tenant: tenant1,
                chargeto: new Date(data1[i].dateto).toLocaleDateString(),
                leaseto: data2[j].leaseto,
                property: data2[j].property,
              });
              counter = counter + 1;
            }
          }
        }
      }
    }
    setMismatch(results);
    setMismatchCounter(counter);
  }

  return (
    <>
      <div className="input">
        <h2>Reporting > Property > Rent Schedule > Excel</h2>
        <label>Rent Schedule</label>
        <input type="file" onChange={updateExcel1} />
      </div>
      <div className="input">
        <h2>Reporting > Tenant > Tenant Listing > Excel</h2>
        <label>Tenant Listing</label>
        <input type="file" onChange={updateExcel2} />
      </div>
      <button onClick={compareResult}>Compare</button>
      <button onClick={reset}>Reset</button>
      {mismatchCounter > 0 && (
        <>
          <div>Error Counter: {mismatchCounter}</div>
          <div>Lease End and Schedule Charge End Date Do Not Match For:</div>
          <div className="mismatch-table">
            <table>
              <tr>
                <th>OK</th>
                <th>Tenant Name</th>
                <th>Lease Ends</th>
                <th>Schedule Charge Ends</th>
              </tr>
              {mismatch.length > 0 &&
                mismatch.map((one) => (
                  <tr className="mismatch">
                    <td>
                      <input type="checkbox"></input>
                    </td>
                    <td>{one.tenant}</td>
                    <td>{one.leaseto}</td>
                    <td>{one.chargeto}</td>
                  </tr>
                ))}
            </table>
          </div>
        </>
      )}
    </>
  );
};

export default Compare;
