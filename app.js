const Core = require('@alicloud/pop-core');
const axios = require('axios');

var client = new Core({
  accessKeyId: 'accessKeyId',
  accessKeySecret: 'accessKeySecret',
  endpoint: 'https://alidns.aliyuncs.com',
  apiVersion: '2015-01-09'
});

var params = {
    "DomainName": "xxx.com"
}
var requestOption = {
  method: 'POST'
};

// 1.获取解析记录的id
async function getRecord(){
  const record = await client.request('DescribeDomainRecords', params, requestOption);
  let resultArr =  record.DomainRecords.Record;
  let recoreid = ''
  let recoreip = '';
  resultArr.forEach((e) => {
      if (e.RR==='@') {
        recoreid = e.RecordId
        recoreip = e.Value
      }
  });
  return {recoreid,recoreip};
}
function updateRecord(id,ip){
    let p = {
        "DomainName":params.DomainName,
        "RecordId": id,
        "RR": "@",
        "Type": "A",
        "Value": ip.toString()
    }
    client.request('UpdateDomainRecord', p, requestOption).then((result) => {
        console.log(result);
      }, (ex) => {
        console.log(ex);
      })
}
setInterval( async()=>{
   let url= 'http://ip-api.com/json';
   let result = await axios.get(url)
//    获取当前公网ip
   let ip = result.data.query
   console.log(`当前公网ip：${ip}`)
    // 获取当前alidns配置信息
    let record = await getRecord();
    // record = JSON.stringify(record);
    console.log(`当前ali配置：${JSON.stringify(record)}`);
    if (ip == record.recoreip) {
        console.log('当前公网ip未改变')
        return;
    }
    // 更新dns配置
    await updateRecord(record.recoreid,ip);
},1000*60*5)


