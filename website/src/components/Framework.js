import React from 'react'
import styled, { css } from 'styled-components'
import { Link as GatsbyLink } from 'gatsby'

export const MEDIA_SIZES = {
  xs: 360,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
}

export const MEDIA = Object.keys(MEDIA_SIZES).reduce((acc, mediaSize) => {
  acc[mediaSize] = `@media (min-width: ${MEDIA_SIZES[mediaSize]}px)`
  return acc
}, {})

export const Center = styled.div`
  text-align: center;
`

export const Container = styled.div`
  position: relative;
  max-width: 940px;
  padding: 0 ${props => props.mobilePadding}%;
  margin: 0 auto;

  ${MEDIA.sm} {
    padding: 0 25px;
  }
  ${MEDIA.md} {
    padding: 0 60px;
  }
  ${MEDIA.lg} {
    padding: 0 75px;
  }
`
Container.defaultProps = {
  mobilePadding: 5,
}

export const Row = styled(({ children, spacing, ...rest }) => (
  <div {...rest}>{children}</div>
))`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin: 0 -${props => props.spacing}px;
`
Row.defaultProps = {
  spacing: 15,
}

export const Col = styled(
  ({ children, base, xs, sm, md, lg, xl, spacing, ...rest }) => (
    <div {...rest}>{children}</div>
  ),
)`
  flex: 1;
  padding: 0 ${props => props.spacing}px;
  ${props =>
    props.base &&
    css`
      flex-basis: ${props => (100 * props.base) / 12}%;
    `}
  ${props =>
    ['xs', 'sm', 'md', 'lg', 'xl']
      .filter(size => props[size])
      .map(
        size => css`
          ${MEDIA[size]} {
            flex-basis: ${props => (100 * props[size]) / 12}%;
          }
        `,
      )};
`
Col.defaultProps = {
  spacing: 15,
}

export const Link = styled(GatsbyLink).attrs(props => ({
  activeStyle: {
    fontWeight: '600',
    background: 'linear-gradient(90deg, #676c95, #4b4f74)',
    color: 'white',
  },
}))`
  color: inherit;
  text-decoration: none;
  transition: color 0.15s;
`

export const ExternalLink = styled.a.attrs(props => ({
  target: '_blank',
  rel: 'noopener noreferrer',
}))`
  color: inherit;
  text-decoration: none;
  transition: color 0.15s;

  &:hover {
    color: #2263e5;
  }
`

export const Flex = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: ${props => props.justify};

  > div {
    margin-right: 15px;
    margin-bottom: 15px;
    flex: ${props => props.type === 'even' && 1};
  }
`
Flex.defaultProps = {
  justify: 'space-between',
}

export const Button = styled.button`
  border: none;
  background: linear-gradient(135deg, #00acff, #6f99fc) no-repeat;
  color: white;
  will-change: opacity;
  box-shadow: 0 4px 8px -1px rgba(25, 80, 137, 0.08),
    0 8px 24px -2px rgba(0, 128, 255, 0.06);
  font-size: 17px;
  font-weight: 500;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
  padding: 8px 16px;
  border-radius: 4px;
  margin-right: 8px;
  margin-bottom: 8px;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`

export const Demo = styled.div`
  background: #eeeefa;
  margin: 15px -5.55% 25px;
  padding: 25px 5% 16px;

  ${MEDIA.sm} {
    padding-left: 25px;
    padding-right: 25px;
    margin-left: -25px;
    margin-right: -25px;
  }

  ${MEDIA.md} {
    border-radius: 8px;
  }
`
