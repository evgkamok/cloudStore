const fs = require("fs");
const path = require("path");

class FileService {
  createDir(file) {
    const filePath = path.join(__dirname, `../files/${file.user}/${file.path}`);

    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath);
    }
  }
}

module.exports = new FileService();

// return new Promise((resolve, reject) => {
//   try {
//     if (!fs.existsSync(filePath)) {
//       fs.mkdirSync(filePath);
//       return resolve({ message: "File was created" });
//     } else {
//       return reject({ message: "File already exist" });
//     }
//   } catch (e) {
//     return reject({ message: "File error" });
//   }
// });
