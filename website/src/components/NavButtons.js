import React from 'react';
import {Link, graphql, StaticQuery} from 'gatsby';
import styled from 'styled-components';
import {MEDIA, Flex, Container} from './Framework';
import {sortActivePages} from '../utils';
import ArrowRight from 'react-feather/dist/icons/arrow-right';
import ArrowLeft from 'react-feather/dist/icons/arrow-left';
import theme from '../css/theme';

const NavButtonsContainer = styled.div`
  margin-top: 4rem;
  border-top: 1px solid ${theme.border};
`;

const FlexContainer = styled(Flex)`
  flex-direction: column;
  margin: 0 -1rem;

  ${MEDIA.sm} {
    flex-direction: row;
    margin: 0 -1.5625rem;
  }
`;

const NavButton = styled(Link)`
  display: block;
  font-weight: bold;
  border-bottom: 2px solid transparent;
  font-size: 1.75rem;
  padding: 3rem 1rem;
  width: 100%;

  &:nth-child(2) {
    border-bottom: 2px solid ${theme.border};
    text-align: right;
    order: -1;
  }

  ${MEDIA.sm} {
    width: 50%;
    padding: 4rem 1.5625rem;

    &:nth-child(2) {
      border-left: 1px solid ${theme.border};
      border-bottom: 2px solid transparent;
      order: initial;
    }
  }

  &:hover {
    color: #2161f2;
    background: #f0f4fe;
    border-bottom: 2px solid #2161f2;
    text-decoration: none;
  }

  &:active {
    border-bottom-style: dashed;
  }
`;

function NavButtons({next}) {
  return (
    <NavButtonsContainer>
      <Container>
        <StaticQuery
          query={allMdxQuery}
          render={data => {
            const links = sortActivePages(data.allMdx.edges).map(
              ({node}) => node,
            );
            const nextLink = links[next];
            const prevLink = next > 1 ? links[next - 2] : null;

            return (
              <FlexContainer>
                {prevLink && (
                  <NavButton to={prevLink.frontmatter.path}>
                    <ArrowLeft
                      aria-label="Previous"
                      style={{
                        verticalAlign: -6,
                        width: '2rem',
                        height: '2rem',
                      }}
                    />{' '}
                    {prevLink.frontmatter.title}
                  </NavButton>
                )}
                {nextLink && (
                  <NavButton to={nextLink.frontmatter.path} data-next>
                    {nextLink.frontmatter.title}{' '}
                    <ArrowRight
                      aria-label="Next"
                      style={{
                        verticalAlign: -6,
                        width: '2rem',
                        height: '2rem',
                      }}
                    />
                  </NavButton>
                )}
              </FlexContainer>
            );
          }}
        />
      </Container>
    </NavButtonsContainer>
  );
}

export default NavButtons;

const allMdxQuery = graphql`
  query {
    allMdx {
      edges {
        node {
          frontmatter {
            title
            path
            index
          }
        }
      }
    }
  }
`;
