import React from 'react'
import { Link, graphql, StaticQuery } from 'gatsby'
import styled from 'styled-components'
import { MEDIA, Flex } from './Framework'
import { sortActivePages } from '../utils'
import ArrowRight from 'react-feather/dist/icons/arrow-right'
import ArrowLeft from 'react-feather/dist/icons/arrow-left'
import Theme from '../css/theme'

const Container = styled(Flex)`
  margin-top: 2.5rem;
  margin-left: -0.5rem;
  margin-right: -0.5rem;

  ${MEDIA.md} {
    margin-left: -2.25rem;
    margin-right: -2.25rem;
  }
`

const NavButton = styled(Link)`
  display: block;
  padding: 2.5rem 1.5625rem;
  border: ${props =>
    props['data-next'] ? 'none' : `1px solid ${Theme.border}`};
  border-radius: 0.25rem;
  background: ${props => (props['data-next'] ? Theme.gradient : 'white')};
  text-decoration: none;
  color: ${props => (props['data-next'] ? 'white' : 'inherit')};
  font-weight: bold;
  margin: 0 0.5rem 0.9375rem;
  font-size: 1.25rem;
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
    width: calc(50% - 1.25rem);
    margin: 0 0.5rem;
    order: initial;

    &[data-next] {
      order: initial;
    }
  }

  ${MEDIA.md} {
    font-size: 1.5rem;
  }
`

function NavButtons({ next }) {
  return (
    <Container>
      <StaticQuery
        query={allMdxQuery}
        render={data => {
          const links = sortActivePages(data.allMdx.edges).map(
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
