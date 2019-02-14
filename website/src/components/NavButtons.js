import React from 'react'
import { Link, graphql, StaticQuery } from 'gatsby'
import styled from 'styled-components'
import { MEDIA, Flex } from './Framework'
import { sortPagesByIndex } from '../utils'
import ArrowRight from 'react-feather/dist/icons/arrow-right'
import ArrowLeft from 'react-feather/dist/icons/arrow-left'
import Theme from '../css/theme'

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
  transition: box-shadow 0.2s;
  margin: 0 10px 15px;
  font-size: 20px;
  transition: all 0.1s;
  width: 100%;

  &:hover {
    border-color: inherit;
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
    padding: 40px;
  }
`

function NavButtons({ next }) {
  return (
    <Flex style={{ marginTop: 40, marginLeft: -10, marginRight: -10 }}>
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
                <NavButton to={prevLink.frontmatter.path} aria-label="Previous">
                  <ArrowLeft style={{ verticalAlign: -4 }} />{' '}
                  {prevLink.frontmatter.title}
                </NavButton>
              )}
              {nextLink && (
                <NavButton
                  to={nextLink.frontmatter.path}
                  data-next
                  aria-label="Next"
                >
                  {nextLink.frontmatter.title}{' '}
                  <ArrowRight style={{ verticalAlign: -4 }} />
                </NavButton>
              )}
            </>
          )
        }}
      />
    </Flex>
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
