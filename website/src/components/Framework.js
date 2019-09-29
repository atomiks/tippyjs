import React from 'react';
import styled, {css} from 'styled-components';
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
  max-width: 940px;
  padding: 0 ${props => props.mobilePadding || '1'}rem;
  margin: 0 auto;

  ${MEDIA.sm} {
    padding: 0 1.5625rem;
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
  margin: 0 -${props => props.spacing || '0.5'}rem;
`;

export const Col = styled(({base, xs, sm, md, lg, xl, spacing, ...rest}) => (
  <div {...rest} />
))`
  flex: 1;
  padding: 0 ${props => props.spacing || '0.5'}rem;
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
`;

export const Link = styled(GatsbyLink).attrs(() => ({
  activeStyle: {
    fontWeight: '600',
    background: 'white',
    color: '#7761d1',
  },
}))`
  color: inherit;
  text-decoration: none;
  transition: color 0.15s;
`;

export const ExternalLink = styled.a.attrs(() => ({
  target: '_blank',
  rel: 'noopener noreferrer',
}))`
  color: inherit;
  text-decoration: none;
  transition: color 0.15s;

  &:hover {
    color: #2263e5;
  }
`;

export const Flex = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: ${props => props.justify || 'space-between'};
  align-items: ${props => props.align || 'center'};

  > div {
    margin-right: 0.9375rem;
    margin-bottom: 0.9375rem;
    flex: ${props => props.type === 'even' && 1};
  }
`;

export const Button = styled.button`
  border: none;
  background: white;
  color: #5183f5;
  border: 2px dashed #5183f5;
  will-change: opacity;
  font-size: 1.0625rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  margin: ${props => (props.marginless ? '0' : '0 0.5rem 0.5rem 0')};
  transition: background 0.2s, color 0.1s;

  &:hover {
    background: #5183f5;
    color: white;
  }
`;

export const Demo = styled.div`
  background: #eeeefa;
  margin: 0.9375rem -1rem 1.5625rem;
  padding: 1.5625rem 1rem 1rem;

  ${MEDIA.sm} {
    padding-left: 1.5625rem;
    padding-right: 1.5625rem;
    margin-left: -1.5625rem;
    margin-right: -1.5625rem;
  }

  ${MEDIA.md} {
    border-radius: 8px;
  }
`;
