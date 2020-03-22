exports.createPages = ({graphql, actions}) => {
  const {createRedirect} = actions;

  const paths = [
    'creating-tooltips',
    'customizing-tooltips',
    'all-props',
    'html-content',
    'themes',
    'animations',
    'tippy-instance',
    'methods',
    'lifecycle-hooks',
    'ajax',
    'accessibility',
    'addons',
    'plugins',
    'misc',
    'faq',
    'motivation',
  ];

  paths.forEach((path) => {
    createRedirect({
      fromPath: `/${path}/`,
      toPath: `/v5/${path}/`,
      isPermanent: true,
    });
  });
};
