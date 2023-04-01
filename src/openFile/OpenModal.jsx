import React, { useState } from "react";
import Modal from "react-modal";
import FileViewer from "react-file-viewer";

const OpenModal = ({ isOpen, fileUrl, closeModal }) => {
  const fileType = fileUrl?.split(".").pop(); // Get the file extension to determine the type of viewer to use
  const [error, setError] = useState(null); // Error state for the file viewer component

  return (
    <Modal isOpen={isOpen} onRequestClose={closeModal}>
      <button onClick={closeModal}>Close Modal</button>
      <FileViewer
        fileType={fileType}
        filePath={fileUrl}
        onError={(e) => setError(e)}
      />
      {error && <div>Error: {error.message}</div>}
    </Modal>
  );
};

export default OpenModal;
