const fs = require("fs");
const path = require("path");

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => {
    if (err) return console.log("Could not delete image!");
    console.log("file was deleted");
  });
};

module.exports = clearImage;
