import React from 'react';
import {StaticQuery, graphql} from 'gatsby';
import Img from 'gatsby-image';
import styled from '@emotion/styled';
import {MEDIA} from '../components/Framework';

const ImgWrapper = styled.div`
  margin-left: -16px;
  margin-right: -16px;
  margin-bottom: 16px;

  ${MEDIA.sm} {
    margin-left: -25px;
    margin-right: -25px;
  }

  ${MEDIA.md} {
    img {
      border-radius: 8px;
    }
  }
`;

const Image = ({name}) => (
  <StaticQuery
    query={graphql`
      query {
        allImageSharp {
          edges {
            node {
              fluid(maxWidth: 840, quality: 95) {
                ...GatsbyImageSharpFluid
                originalName
              }
            }
          }
        }
      }
    `}
    render={(data) => {
      const image = data.allImageSharp.edges.find(
        (edge) => edge.node.fluid.originalName === name
      );

      return image ? (
        <ImgWrapper>
          <Img fluid={image.node.fluid} />
        </ImgWrapper>
      ) : null;
    }}
  />
);

export default Image;
