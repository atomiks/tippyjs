import React from 'react'
import { Link, graphql, StaticQuery } from 'gatsby'
import styled from 'styled-components'
import { MEDIA, Flex } from './Framework'
import { sortPagesByIndex } from '../utils'
import ArrowRight from 'react-feather/dist/icons/arrow-right'
import ArrowLeft from 'react-feather/dist/icons/arrow-left'

const NavButton = styled(Link)`
  display: block;
  padding: 40px;
  border: ${props =>
    props['data-next'] ? 'none' : '1px solid rgba(0, 16, 64, 0.15)'};
  border-radius: 4px;
  background: ${props =>
    props['data-next'] ? 'linear-gradient(90deg,#f3edff,#edf5ff)' : 'white'};
  text-decoration: none;
  color: ${props => (props['data-next'] ? '#2569d7' : 'inherit')};
  filter: ${props => props['data-next'] && 'saturate(1.15)'};
  font-weight: bold;
  transition: box-shadow 0.2s;
  flex: 1;
  margin: 0 10px;
  max-width: 425px;
  font-size: 20px;
  transition: all 0.1s;

  &:hover {
    border-color: inherit;
    border-bottom: ${props => props['data-next'] && 'none'};
    filter: ${props => props['data-next'] && 'saturate(1.15) brightness(1.02)'};
  }

  ${MEDIA.md} {
    font-size: 24px;
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
                  <ArrowLeft style={{verticalAlign:-4}} /> {prevLink.frontmatter.title}
                </NavButton>
              )}
              {nextLink && (
                <NavButton to={nextLink.frontmatter.path} data-next aria-label="Next">
                  {nextLink.frontmatter.title} <ArrowRight style={{verticalAlign:-4}} />
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
