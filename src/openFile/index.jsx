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

const OpenFile = () => {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [openModal, setopenModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    const storage = getStorage(firebaseapp);
    const storageRef = storage.ref();
    const fileRef = storageRef.child(file.name);
    const uploadTask = fileRef.put(file);
    // const storage = firebaseapp.storage();
    // const fileRef = ref(storage, file.name);
    // await uploadBytes(fileRef, file);
    // const uploadTask = await uploadBytesResumable(fileRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error(error);
      },
      () => {
        window.alert("Upload complete!");
      }
    );

    const url = await getDownloadURL(fileRef);
    setFileUrl(url);
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} accept=".jpg" />
      <button onClick={handleUpload}>Upload File</button>
      {/* {fileUrl && (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          Download File
        </a>
      )} */}

      {uploadProgress && (
        <div>Upload progress: {uploadProgress.toFixed(2)}%</div>
      )}

      {fileUrl && <button onClick={() => setopenModal(true)}>Open File</button>}
      <OpenModal
        isOpen={openModal}
        fileUrl={fileUrl}
        closeModal={() => setopenModal(false)}
      />
    </div>
  );
};

export default OpenFile;
