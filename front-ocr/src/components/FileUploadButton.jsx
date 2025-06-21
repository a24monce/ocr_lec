import React from "react";

const FileUploadButton = ({ onUpload }) => (
  <label className="upload-btn">
    <input
      type="file"
      style={{ display: "none" }}
      onChange={e => onUpload(e.target.files[0])}
    />
    Déposer
  </label>
);

export default FileUploadButton;