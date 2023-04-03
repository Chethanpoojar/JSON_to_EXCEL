// import React, { useState } from "react";
// import FileViewer from "react-file-viewer";
// // import fileType from "file-type";

// function OpenFile() {
//   const [file, setFile] = useState(null);
//   const [filetype, setFileType] = useState(null);

//   const handleFileSelect = (e) => {
//     setFile(e.target.files[0]);
//     console.log(e.target.files[0],"e.target.files[0]");
//     // Determine the file type based on the file extension
//       setFileType(e.target.files[0].type);
//   };

//   return (
//     <div>
//       <input type="file" onChange={handleFileSelect} accept=".jpg" />
//       {file && filetype && <FileViewer filetype={filetype} filePath={"../train.jpg"} />}
//     </div>
//   );
// }

// export default OpenFile;

import React, { useState } from "react";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import { firebaseapp } from "./Firebase";
import OpenModal from "./OpenModal";
import { useCallback } from "react";

const OpenFile = () => {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [openModal, setopenModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);

  console.log(fileUrl, "fileUrlfileUrl");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = useCallback(async () => {
    const storage = getStorage(firebaseapp);
    const fileRef = ref(storage, file.name);
    await uploadBytes(fileRef, file);
    const uploadTask = await uploadBytesResumable(fileRef, file);

    console.log("Step1");
    const fileRef2 = storage.refFromURL(
      `gs://${uploadTask?.bucket}/${uploadTask?.name}`
    );

    console.log("Step2");
    const downloadURL = await fileRef2.getDownloadURL();

    console.log("Download URL:", downloadURL);
    console.log("finished");
  }, [file]);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    const storage = getStorage(firebaseapp);
    const path = `/images/${file.name}`;
    // const ref = storage.ref(path);
    const fileRef = ref(storage, path);
    // await uploadBytes(fileRef, file);
    // await fileRef.put(file);
    const uploadTask = await uploadBytesResumable(fileRef, file);
    const URL =
      uploadTask &&
      `https://firebasestorage.googleapis.com/v0/b/show-file.appspot.com/o/${fileRef?.fullPath}?alt=media&token=${uploadTask?.downloadTokens}`;
    setFileUrl(URL);
    setFile(null);

    console.log(uploadTask, "URL");
  };

  return (
    <div style={{ marginTop: "4rem" }}>
      <input type="file" onChange={handleFileChange} accept=".jpg" />
      <button onClick={handleFileUpload}>Upload File</button>
      {/* {fileUrl && (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          Download File
        </a>
      )} */}

      {uploadProgress && (
        <div>Upload progress: {uploadProgress.toFixed(2)}%</div>
      )}

      <div>
        {fileUrl && (
          <button onClick={() => setopenModal(true)}>Open File</button>
        )}
        <OpenModal
          isOpen={openModal}
          fileUrl={fileUrl}
          closeModal={() => setopenModal(false)}
        />
      </div>
    </div>
  );
};

export default OpenFile;
