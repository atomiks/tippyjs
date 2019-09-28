import React from 'react'
import styled from 'styled-components'
import { MEDIA } from './Framework'

const Banner = styled.div`
  position: relative;
  top: -1.5625rem;
  background: #4b4f74;
  color: white;
  border-radius: 0 0 10px 10px;
  padding: 0.9375rem;
  font-size: 0.9375rem;
  margin-bottom: 0.9375rem;
  margin-left: 50px;
  font-weight: 600;

  a {
    color: white;
    border-bottom: 1px solid white;

    &:hover {
      color: cyan;
    }
  }

  ${MEDIA.lg} {
    margin-left: 0;
    margin-bottom: 1.5625rem;
  }
`

function VersionNotice() {
  return (
    <Banner>
      You're reading the docs for the newest version, v4!
      <br />
      <a
        href="https://github.com/atomiks/tippyjs/releases/tag/v4.0.0"
        rel="noopener noreferrer"
        target="_blank"
      >
        Read the migration guide from v3
      </a>{' '}
      or{' '}
      <a
        href="https://github.com/atomiks/tippyjs/tree/8c8a367fa8de94ddd1b1cc7fb259dd5d5f075458/website/src/pages"
        rel="noopener noreferrer"
        target="_blank"
      >
        view the old docs for v3
      </a>
    </Banner>
  )
}

export default VersionNotice
