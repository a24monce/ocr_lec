import React from 'react';
import BLList from '../features/bl/blList';
import FileUploadButton from '../components/FileUploadButton';

function BLPage() {
  return (
    <div>
      <h1>Bons de Livraison</h1>
      <FileUploadButton type="bl" />
      <BLList />
    </div>
  );
}

export default BLPage;
