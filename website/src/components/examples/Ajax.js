import React, {useState} from 'react';
import Tippy from '../Tippy';
import {Button} from '../Framework';

function Img({src}) {
  return (
    <img
      style={{
        width: 200,
        height: 200,
        display: 'block',
      }}
      alt="Unsplash"
      src={src}
    />
  );
}

function Ajax({children}) {
  const [fetching, setFetching] = useState(false);
  const [src, setSrc] = useState(null);
  const [error, setError] = useState(null);

  const content = error || src ? <Img src={src} /> : 'Loading...';

  return (
    <Tippy
      content={content}
      onShow={async () => {
        if (fetching || src || error) {
          return;
        }

        setFetching(true);

        try {
          const response = await fetch('https://unsplash.it/200/?random');
          const blob = await response.blob();
          setSrc(URL.createObjectURL(blob));
        } catch (e) {
          setError(`Fetch failed. ${e}`);
        } finally {
          setFetching(false);
        }
      }}
      onHidden={() => {
        setSrc(null);
        setError(null);
      }}
    >
      <Button>{children}</Button>
    </Tippy>
  );
}

export default Ajax;
