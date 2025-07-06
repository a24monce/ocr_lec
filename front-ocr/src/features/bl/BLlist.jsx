import React, { useEffect, useState } from 'react';
import { getBLs } from '../../api/blApi';

function BLlist() {
  const [bls, setBls] = useState([]);

  useEffect(() => {
    getBLs().then(setBls);
  }, []);

  return (
    <ul>
      {bls.map(bl => (
        <li key={bl.id}>{bl.name}</li>
      ))}
    </ul>
  );
}

export default BLlist;