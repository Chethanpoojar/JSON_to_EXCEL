import React, { useState } from "react";
import Modal from "react-modal";
import Docx from "docx";
import { firebaseapp } from "./Firebase";
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import { Button } from "@material-ui/core";

function FileViewer() {
  const [fileContent, setFileContent] = useState("");
  const [openModal, setopenModal] = useState(false);
  const [fileType, setFileType] = useState("");
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileRead = (e) => {
    const content = e.target.result;
    setFileContent(content);
  };

  //   const handleFileChosen = (file) => {
  //     const reader = new FileReader();
  //     reader.onloadend = handleFileRead;
  //     reader.readAsArrayBuffer(file);
  //     setopenModal(true);

  //     const fileType = file.name.split(".").pop();
  //     setFileType(fileType);
  //   };

  const handleFileUpload = async (e) => {
    setLoading(true)
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = handleFileRead;

    e.preventDefault();
    const storage = getStorage(firebaseapp);
    const path = `${file.name}`;
    const fileRef = ref(storage, path);

    const uploadTask = await uploadBytesResumable(fileRef, file);

    // handle completion events here
    getDownloadURL(fileRef)
      .then((downloadURL) => {
        setFileUrl(downloadURL);
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error getting download URL:", error);
      });


    // Determine the file type
    const fileType = file.type;
    setFileType(fileType);

    // Read the file content based on the file type
    if (fileType.startsWith("image/")) {
      reader.readAsDataURL(file);
    } else if (
      fileType === "application/vnd.ms-excel" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      reader.readAsBinaryString(file);
    } else if (fileType === "application/pdf") {
      reader.readAsArrayBuffer(file);
    } else if (
      fileType === "application/msword" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };

  //   const getContent = () => {
  //     if (fileType === "pdf") {
  //       // Return PDF viewer
  //       return (
  //         <embed
  //           src={URL.createObjectURL(
  //             new Blob([fileContent], { type: "application/pdf" })
  //           )}
  //           type="application/pdf"
  //           width="100%"
  //           height={`calc(100vh - 100px)`}
  //         />
  //       );
  //     } else if (fileType === "xlsx") {
  //       // Return Excel viewer
  //       return (
  //         <iframe
  //           src={`data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${btoa(
  //             String.fromCharCode.apply(null, new Uint8Array(fileContent))
  //           )}`}
  //           width="100%"
  //           height="100%"
  //         />
  //       );
  //     } else if (fileType.startsWith("image/")) {
  //       // Return image viewer
  //       return (
  //         <img
  //           src={URL.createObjectURL(
  //             new Blob([fileContent], { type: "image/*" })
  //           )}
  //           alt="Preview"
  //         />
  //       );
  //     } else {
  //       // Return text content
  //       return <pre>{fileContent}</pre>;
  //     }
  //   };

  const renderFileContent = () => {
    if (fileType.startsWith("image/")) {
      return (
        <img
          src={fileUrl}
          alt="Uploaded file"
          style={{
            display: "flex",
            justifyContent: "center",
            height: `calc(100vh - 150px)`,
            width: "70rem",
          }}
        />
      );
    } else if (
      fileType === "application/vnd.ms-excel" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      return (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${fileUrl}`}
          style={{
            display: "flex",
            justifyContent: "center",
            height: `calc(100vh - 150px)`,
            width: "70rem",
          }}
        />
      );
    } else if (fileType === "application/pdf") {
      return (
        <iframe
          src={fileUrl}
          style={{
            display: "flex",
            justifyContent: "center",
            height: `calc(100vh - 150px)`,
            width: "70rem",
          }}
        />
      );
    } else if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return (
        <>
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${fileUrl}`}
            style={{
              display: "flex",
              justifyContent: "center",
              height: `calc(100vh - 100px)`,
              width: "70rem",
            }}
          />
        </>
      );
    } else {
      return (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${fileUrl}`}
          style={{
            display: "flex",
            justifyContent: "center",
            height: `calc(100vh - 150px)`,
            width: "70rem",
          }}
        />
      );
    }
  };

  return (
    <div>
      <div style={{ marginTop: "10rem" }}>
        <input type="file" onChange={(e) => handleFileUpload(e)} />

        <Button
          // className={classes.button}
          variant="contained"
          color="primary"
          onClick={() => setopenModal(true)}
          disabled={!fileContent}
          loading={loading}
        >
          View File
        </Button>
      </div>

      {fileContent && (
        <Modal isOpen={openModal} onRequestClose={() => setopenModal(false)}>
          <button onClick={() => setopenModal(false)}>Close Modal</button>

          <div>{fileContent && renderFileContent()}</div>
        </Modal>
      )}
    </div>
  );
}

export default FileViewer;
