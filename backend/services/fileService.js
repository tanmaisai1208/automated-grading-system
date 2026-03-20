const path = require("path");

exports.saveFile = async (file) => {
  const fileName = Date.now() + "-" + file.name;
  const filePath = path.join(__dirname, "../uploads", fileName);

  await file.mv(filePath);

  return filePath;
};