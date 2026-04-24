const path = require("path");
const { UPLOADS_DIR } = require("../paths");

exports.saveFile = async (file) => {
  const fileName = Date.now() + "-" + file.name;
  const filePath = path.join(UPLOADS_DIR, fileName);

  await file.mv(filePath);

  return filePath;
};