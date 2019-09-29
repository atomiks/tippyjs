import React from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';

function NotFoundPage({pageContext}) {
  const context = {...pageContext, frontmatter: {title: '404: Not Found'}};
  return (
    <Layout pageContext={context}>
      <SEO title="404: Not found" pageContext={context} />
      <p>Unfortunately, the page you were looking for does not exist.</p>
    </Layout>
  );
}

export default NotFoundPage;
