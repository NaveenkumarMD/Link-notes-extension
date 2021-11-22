
var data={
    "name":"test",
}
let data1=JSON.stringify(data);
console.log(data1);
console.log(data1.name);

JSON.parse(data1.name)
let data2=JSON.parse(data1);
console.log(data2.name)