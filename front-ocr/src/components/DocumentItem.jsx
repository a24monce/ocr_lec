import React from "react";

const DocumentItem = ({ doc }) => (
  <div className="doc-item">
    <div className="doc-thumb">{/* Miniature ou icône */}</div>
    <div>
      <div className="doc-title">{doc.name}</div>
      <div className="doc-desc">{doc.description}</div>
      <div className="doc-date">{doc.date}</div>
    </div>
  </div>
);

export default DocumentItem;