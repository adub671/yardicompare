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
        // const day1 = date1.getDate();
        // const day2 = date2.getDate();
        // const month1 = date1.getMonth();
        // const month2 = date2.getMonth();
        // const year1 = date1.getYear();
        // const year2 = date2.getYear();
        const tenant1 = data1[i].tenant;
        const tenant2 = data2[j].tenant;
        const dateDiff =
          Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24);

        if (tenant1 === tenant2) {
          if (data2[j].leaseto === undefined && data1[i].dateto === undefined) {
          } else {
            if (
              dateDiff > 2
              // || month1 !== month2 || year1 !== year2
            ) {
              results.push({
                tenant: tenant1,
                chargeto: new Date(data1[i].dateto).toLocaleDateString(),
                leaseto: data2[j].leaseto,
                property: data2[j].property,
              });
              console.log(dateDiff, "date difference", tenant1);
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
        <div>Reporting > Property > Rent Schedule > Excel</div>
        <label>Rent Schedule</label>
        <input type="file" onChange={updateExcel1} />
      </div>
      <div className="input">
        <div>Reporting > Tenant > Tenant Listing > Excel</div>
        <label>Tenant Listing</label>
        <input type="file" onChange={updateExcel2} />
      </div>
      <button onClick={compareResult}>Compare</button>
      <button onClick={reset}>Reset</button>
      <div>Error Counter: {mismatchCounter}</div>
      <div>Lease End and Schedule Charge End Date Do Not Match For:</div>
      <div className="mismatches">
        {mismatch.length > 0 &&
          mismatch.map((one) => (
            <>
              <div className="mismatch">
                <input type="checkbox"></input>
                {one.tenant +
                  "-" +
                  one.property +
                  "-" +
                  one.leaseto +
                  "-" +
                  one.chargeto}
              </div>
            </>
          ))}
      </div>
    </>
  );
};

export default Compare;
