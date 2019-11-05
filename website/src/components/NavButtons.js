import React from 'react';
import {Link, graphql, StaticQuery} from 'gatsby';
import styled from 'styled-components';
import {MEDIA, Flex, Container} from './Framework';
import {sortActivePages} from '../utils';
import ArrowRight from 'react-feather/dist/icons/arrow-right';
import ArrowLeft from 'react-feather/dist/icons/arrow-left';
import theme from '../css/theme';

const NavButtonsContainer = styled.div`
  margin-top: 64px;
  border-top: 1px solid ${theme.border};
`;

const FlexContainer = styled(Flex)`
  flex-direction: column;
  margin: 0 -16px;

  ${MEDIA.sm} {
    flex-direction: row;
    margin: 0 -25px;
  }
`;

const NavButton = styled(Link)`
  display: block;
  font-weight: bold;
  border-bottom: 2px solid transparent;
  font-size: 28px;
  padding: 48px 16px;
  width: 100%;

  &:nth-child(2) {
    border-bottom: 2px solid ${theme.border};
    text-align: right;
    order: -1;
  }

  ${MEDIA.sm} {
    width: 50%;
    padding: 64px 25px;

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
                        width: 32,
                        height: 32,
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
                        width: 32,
                        height: 32,
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
