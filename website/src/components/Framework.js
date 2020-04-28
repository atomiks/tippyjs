import React from 'react';
import styled from '@emotion/styled';
import {css} from '@emotion/core';
import {Link as GatsbyLink} from 'gatsby';

export const MEDIA_SIZES = {
  xs: 360,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
};

export const MEDIA = Object.keys(MEDIA_SIZES).reduce((acc, mediaSize) => {
  acc[mediaSize] = `@media (min-width: ${MEDIA_SIZES[mediaSize]}px)`;
  return acc;
}, {});

export const Center = styled.div`
  text-align: center;
`;

export const Container = styled.div`
  position: relative;
  max-width: 875px;
  padding: 0 ${(props) => props.mobilePadding || '16'}px;
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
`;

export const Row = styled(({spacing, ...rest}) => <div {...rest} />)`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin: 0 -${(props) => props.spacing || '8'}px;
`;

export const Col = (props) => {
  const {spacing = 8, base, xs, sm, md, lg, xl, ...rest} = props;

  const mediaCss = ['xs', 'sm', 'md', 'lg', 'xl']
    .filter((size) => props[size])
    .map(
      (size) => css`
        ${MEDIA[size]} {
          flex-basis: calc(${(100 * props[size]) / 12}% - ${2 * spacing}px);
        }
      `
    );

  return (
    <div
      css={css`
        flex: 1;
        padding: 0 ${spacing}px;
        flex-basis: ${(100 * base) / 12}%;
        ${mediaCss}
      `}
      {...rest}
    />
  );
};

export const Link = (props) => (
  <GatsbyLink
    css={css`
      color: inherit;
      text-decoration: none;
      transition: color 0.15s;
    `}
    activeStyle={{fontWeight: '600', background: 'white', color: '#7761d1'}}
    {...props}
  />
);

export const ExternalLink = (props) => (
  <a
    target="_blank"
    rel="noopener noreferrer"
    css={css`
      color: inherit;
      text-decoration: none;
      transition: color 0.15s;

      &:hover {
        color: #2263e5;
      }
    `}
    {...props}
  >
    {/* jsx a11y rule */}
    {props.children}
  </a>
);

export const Flex = styled.div`
  display: flex;
  justify-content: ${(props) => props.justify || 'space-between'};
  align-items: ${(props) => props.align || 'center'};

  > div {
    margin-right: 15px;
    margin-bottom: 15px;
    flex: ${(props) => props.type === 'even' && 1};
  }
`;

export const Button = styled.button`
  border: none;
  background: white;
  color: #5183f5;
  border: 2px dashed #5183f5;
  will-change: opacity;
  font-size: 16px;
  font-weight: 600;
  padding: 10px 16px;
  border-radius: 4px;
  transition: background 0.2s, color 0.1s;

  &:hover {
    background: #5183f5;
    color: white;
  }
`;

export const Demo = styled.div`
  background: #eeeefa;
  margin: 15px -16px 25px;
  padding: 25px 16px;

  ${MEDIA.sm} {
    padding-left: 25px;
    padding-right: 25px;
    margin-left: -25px;
    margin-right: -25px;
  }

  ${MEDIA.md} {
    border-radius: 8px;
  }

  > ${Button} {
    margin: 5px;
  }
`;
