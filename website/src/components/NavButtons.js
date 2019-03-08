import React from 'react'
import { Link, graphql, StaticQuery } from 'gatsby'
import styled from 'styled-components'
import { MEDIA, Flex } from './Framework'
import { sortPagesByIndex } from '../utils'
import ArrowRight from 'react-feather/dist/icons/arrow-right'
import ArrowLeft from 'react-feather/dist/icons/arrow-left'
import Theme from '../css/theme'

const Container = styled(Flex)`
  margin-top: 40px;
  margin-left: -10px;
  margin-right: -10px;

  ${MEDIA.md} {
    margin-left: -35px;
    margin-right: -35px;
  }
`

const NavButton = styled(Link)`
  display: block;
  padding: 40px 25px;
  border: ${props =>
    props['data-next'] ? 'none' : `1px solid ${Theme.border}`};
  border-radius: 4px;
  background: ${props => (props['data-next'] ? Theme.gradient : 'white')};
  text-decoration: none;
  color: ${props => (props['data-next'] ? 'white' : 'inherit')};
  font-weight: bold;
  margin: 0 10px 15px;
  font-size: 20px;
  transition: box-shadow 0.15s, border 0.15s, filter 0.15s;
  width: 100%;

  &:hover {
    border-color: inherit;
    background: ${props => (props['data-next'] ? Theme.gradient : 'white')};
    color: ${props => (props['data-next'] ? 'white' : 'inherit')};
    text-decoration: none;
  }

  &[data-next] {
    border-bottom: none;
    filter: saturate(1.15);
    order: -1;

    &:hover {
      filter: saturate(1.15) brightness(1.2);
    }
  }

  ${MEDIA.sm} {
    width: calc(50% - 20px);
    margin: 0 10px;
    order: initial;

    &[data-next] {
      order: initial;
    }
  }

  ${MEDIA.md} {
    font-size: 24px;
  }
`

function NavButtons({ next }) {
  return (
    <Container>
      <StaticQuery
        query={allMdxQuery}
        render={data => {
          const links = sortPagesByIndex(data.allMdx.edges).map(
            ({ node }) => node,
          )
          const nextLink = links[next]
          const prevLink = next > 1 ? links[next - 2] : null

          return (
            <>
              {prevLink && (
                <NavButton to={prevLink.frontmatter.path}>
                  <ArrowLeft
                    aria-label="Previous"
                    style={{ verticalAlign: -4 }}
                  />{' '}
                  {prevLink.frontmatter.title}
                </NavButton>
              )}
              {nextLink && (
                <NavButton to={nextLink.frontmatter.path} data-next>
                  {nextLink.frontmatter.title}{' '}
                  <ArrowRight aria-label="Next" style={{ verticalAlign: -4 }} />
                </NavButton>
              )}
            </>
          )
        }}
      />
    </Container>
  )
}

export default NavButtons

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
`
