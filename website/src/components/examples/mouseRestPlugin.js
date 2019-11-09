export default {
  name: 'mouseRest',
  defaultValue: false,
  fn(instance) {
    const {reference} = instance;
    const DEBOUNCE_MS = 80;

    let timeout;

    // If the `trigger` isn't `"mouseenter"`, then this plugin doesn't apply.
    function getIsEnabled() {
      return (
        instance.props.mouseRest &&
        instance.props.trigger.indexOf('mouseenter') !== -1
      );
    }

    return {
      onCreate() {
        if (!getIsEnabled()) {
          return;
        }

        const triggerWithoutMouseEnter = instance.props.trigger
          .replace('mouseenter', '')
          .trim();

        instance.setProps({trigger: triggerWithoutMouseEnter});

        reference.addEventListener('mousemove', () => {
          clearTimeout(timeout);
          timeout = setTimeout(() => instance.show(), DEBOUNCE_MS);
        });

        reference.addEventListener('mouseleave', () => {
          clearTimeout(timeout);
          instance.hide();
        });
      },
      onDestroy() {
        clearTimeout(timeout);
      },
    };
  },
};
