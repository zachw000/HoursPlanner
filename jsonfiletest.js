/*jshint esversion: 6 */
let jsonfile = require('jsonfile');
var filename = "json/testio.json";
var obj;

var readAndRemove = function() {
  jsonfile.readFile(filename, function(err, ret) {
    obj = ret;
    readObject();
  });
};

var readObject = function() {
  console.log(obj.testdata);
};

var appendData = function(data, nullprotect = true) {
  if (obj === null || (data === null && nullprotect)) return;

  if (obj instanceof Object) {
    obj.testdata.push(data);
    jsonfile.writeFile(filename, obj, function(err) {
      if (err === null) readAndRemove();
      else console.log(err);
    });
  }
};

var printObject = function() {
  console.log(obj.testdata);
  appendData({
    name: 'obj3',
    prop: 'really'
  });
};

jsonfile.readFile(filename, function(err, ret) {
  obj = ret;
  printObject();
});
