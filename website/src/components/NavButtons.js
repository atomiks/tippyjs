import React from 'react';
import {Link, graphql, StaticQuery} from 'gatsby';
import styled from '@emotion/styled';
import {MEDIA, Flex, Container} from './Framework';
import {sortActivePages} from '../utils';
import ArrowRight from 'react-feather/dist/icons/arrow-right';
import ArrowLeft from 'react-feather/dist/icons/arrow-left';
import theme from '../css/theme';
import {css} from '@emotion/core';
import {Location} from '@reach/router';

const NavButtonsContainer = styled.div`
  margin-top: 64px;
  border-top: 1px solid ${theme.border};
`;

const NavButtonFlex = styled(Flex)`
  margin: 0 -15px;

  ${MEDIA.md} {
    margin: 0 -25px;
  }
`;

const NavButton = styled(Link)`
  position: relative;
  display: block;
  font-weight: bold;
  border-bottom: 2px solid transparent;
  padding: 48px 16px;
  flex: 1 1 auto;
  font-size: 18px;

  ${MEDIA.xs} {
    font-size: 22px;
  }

  ${MEDIA.sm} {
    font-size: 24px;
  }

  ${MEDIA.md} {
    width: 50%;
    padding: 64px 16px;
  }

  ${MEDIA.xl} {
    font-size: 26px;
  }

  &:hover {
    color: #7cbbff;
    background: rgba(0, 0, 0, 0.1);
    border-bottom: 2px solid #425991;
    text-decoration: none;
  }

  &:active {
    border-bottom-style: dashed;
  }

  &[data-next] {
    text-align: right;
    padding-right: 45px;

    ${MEDIA.xs} {
      padding-right: 50px;
    }

    ${MEDIA.md} {
      padding-right: 65px;

      &:first-of-type {
        margin-left: 50%;
      }

      &:not(:first-of-type) {
        border-left: 1px solid ${theme.border};
      }
    }
  }

  &[data-prev] {
    padding-left: 45px;

    ${MEDIA.xs} {
      padding-left: 50px;
    }

    ${MEDIA.md} {
      padding-left: 65px;

      &:last-of-type {
        margin-right: 50%;
      }
    }
  }
`;

const arrowCss = css`
  position: absolute;
  top: 50%;
  vertical-align: -6px;
  width: 24px;
  height: 24px;
  margin-top: -12px;

  ${MEDIA.xs} {
    width: 28px;
    height: 28px;
    margin-top: -14px;
  }

  &[data-prev] {
    left: 16px;

    ${MEDIA.md} {
      left: 25px;
    }
  }

  &[data-next] {
    right: 16px;

    ${MEDIA.md} {
      right: 25px;
    }
  }

  ${MEDIA.md} {
    margin-top: -16px;
    width: 32px;
    height: 32px;
  }
`;

function NavButtons({next}) {
  return (
    <NavButtonsContainer>
      <Container>
        <Location>
          {({location}) => (
            <StaticQuery
              query={allMdxQuery}
              render={(data) => {
                const links = sortActivePages(data.allMdx.edges, location).map(
                  ({node}) => node
                );
                const nextLink = links[next];
                const prevLink = next > 1 ? links[next - 2] : null;

                return (
                  <NavButtonFlex>
                    {prevLink && (
                      <NavButton to={prevLink.frontmatter.path} data-prev>
                        <ArrowLeft
                          aria-label="Previous"
                          css={arrowCss}
                          data-prev
                        />{' '}
                        {prevLink.frontmatter.title}
                      </NavButton>
                    )}
                    {nextLink && (
                      <NavButton to={nextLink.frontmatter.path} data-next>
                        {nextLink.frontmatter.title}{' '}
                        <ArrowRight
                          aria-label="Next"
                          css={arrowCss}
                          data-next
                        />
                      </NavButton>
                    )}
                  </NavButtonFlex>
                );
              }}
            />
          )}
        </Location>
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
