const xlsx = require("xlsx");
const workbook = xlsx.readFile("./bangcong.xlsx");
const sheetName = "Chấm công";
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet);
const data1 = xlsx.utils.sheet_to_json(worksheet, { header: "A" })

const findValueByKey = (keys, array) => {
    for (let i = 0; i < array.length; i++) {
        const obj = array[i];
        const objKey = Object.keys(obj)[0];

        if (keys === objKey) {
            return obj[objKey];
        }
    }
    return null;
}

const addMissingKey = (object) => {
    for (let i = 1; i <= 140; i++) {
        const key = `__EMPTY_${i}`;
        if (!(key in object)) {
            object[key] = object[`__EMPTY_${i - 1}`];
        }
    }
};
addMissingKey(data[1]);

const checkStringMapping = (inputString, stringObject) => {
    for (let key in stringObject) {
        if (stringObject.hasOwnProperty(key)) {
            if (inputString === stringObject[key]) {
                return true;
            }
        }
    }

    return false;
};

const allData = {};
// console.log('check data[3]',data[3])

//Lọc dữ liệu liệu từng nhân viên
for (let row = 4; row < data.length; row++) {
    let moneyArray = [];
    let dateWork = {};
    let charArray = [];
    let currentData = [];
    let shiftObj = {};
   //Lọc và lấy dữ liệu số giờ làm việc thông qua mã ca và số tiền
    for (let column in data[3]) {
        const value = data[3][column];
        const colValue = data[row][column] || 0;
        if (checkStringMapping(value, data[3])) {
            if (value === "$" && value !== undefined) {
                moneyArray.push(colValue);

            } else {
                dateWork[data[1][column]] = { ...dateWork[data[1][column]], [value]: colValue };
                charArray.push(value);
            }
        }
    }
    // Map dữ liệu mã ca và số tiền tương ứng với mã ca đó
    for (let column in data[3]) {
        const value = data[3][column];
        const colValue = data[row][column] || 0;
        if (value !== "$") {
            currentData.push(value);
        } else {
            while (currentData.length > 0) {
                let element = currentData.shift();
                shiftObj[data[1][column]] = { ...shiftObj[data[1][column]], [element]: colValue }
            }
            // console.log('checkshift', Object.values(shiftObj))
        }
    }

    // Tính tổng tiền theo ngày và tháng
    let x2TotalMoneyMonth = 0;
    for (let index in dateWork) {
        dateWork[index]["totalMoneyDay"] = 0
        for (let i = 0; i < Object.keys(dateWork[index]).length ; i++) {
            
            if (findValueByKey(Object.keys(dateWork[index])[i], Object.values(shiftObj)) !== null) {
                dateWork[index]["totalMoneyDay"] +=
                    ((Object.values(dateWork[index])[i]) !== undefined ? (Object.values(dateWork[index])[i]) : 0) *
                    (findValueByKey(Object.keys(dateWork[index])[i], Object.values(shiftObj)) !== null ? 
                    findValueByKey(Object.keys(dateWork[index])[i], Object.values(shiftObj)) : 0);
                
            }
            console.log("check12345", dateWork[index])
            // console.log("test", findValueByKey(Object.keys(dateWork[index])[i], Object.values(shiftObj)))

        }
        x2TotalMoneyMonth = x2TotalMoneyMonth + dateWork[index]["totalMoneyDay"];
    }
    
    dateWork["totalMoneyMonth"] = Math.round(x2TotalMoneyMonth / 2);
    allData[data[row].__EMPTY_2] = dateWork;
   

}
console.log('Doc va phan tich du lieu file Excel:', allData)
