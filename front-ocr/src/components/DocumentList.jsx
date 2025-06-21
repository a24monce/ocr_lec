import React from "react";
import DocumentItem from "./DocumentItem";

const DocumentList = ({ documents }) => (
  <div>
    {documents.map((doc, idx) => (
      <DocumentItem key={idx} doc={doc} />
    ))}
  </div>
);

export default DocumentList;