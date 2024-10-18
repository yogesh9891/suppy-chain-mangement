import fs from "fs";

export const storeFileAndReturnNameBase64 = async (base64: string) => {
  const tempBase64 = base64.split(",");
  const extension = tempBase64[0].split("/")[1];
  const filename = new Date().getTime() + `.${extension.split(";")[0]}`;
  return new Promise((resolve, reject) => {
    fs.writeFile(
      `./public/uploads/${filename}`,
      tempBase64[1],
      "base64",
      (err) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        resolve(filename);
      }
    );
  });
};

export const removeLocalFile = (filename: string) => {
  let localPath = `./public/uploads/${filename}`;
  fs.unlink(localPath, (err) => {
    if (err) console.log("Error while removing local files: ", err);
    else {
      console.log("Removed local: ", localPath);
    }
  });
};
