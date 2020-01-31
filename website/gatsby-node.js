/**
 * TODO: For some reason this doesn't work, get it to work :-(
 */
exports.createPages = ({graphql, actions}) => {
  const {createRedirect} = actions;
  createRedirect({
    fromPath: '/all-options/',
    toPath: '/all-props/',
    isPermanent: true,
    redirectInBrowser: true,
  });
};
