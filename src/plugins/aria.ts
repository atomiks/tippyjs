import {Plugin} from '../types';
import {normalizeToArray} from '../utils';

interface Aria extends Plugin {
  name: 'aria';
  defaultValue: {
    content: 'describedby';
    expanded: true;
  };
}

const aria: Aria = {
  name: 'aria',
  defaultValue: {
    content: 'describedby',
    expanded: true,
  },
  fn(instance) {
    const hasAriaExpanded = instance.reference.hasAttribute('aria-expanded');
    handleAriaExpandedAttribute();

    function handleAriaContentAttribute(): void {
      const {aria} = instance.props;

      if (!aria.content) {
        return;
      }

      const attr = `aria-${aria.content}`;
      const id = instance.popper.id;
      const nodes = normalizeToArray(
        instance.props.triggerTarget || instance.reference
      );

      nodes.forEach((node) => {
        const currentValue = node.getAttribute(attr);

        if (instance.state.isVisible) {
          node.setAttribute(attr, currentValue ? `${currentValue} ${id}` : id);
        } else {
          const nextValue = currentValue && currentValue.replace(id, '').trim();

          if (nextValue) {
            node.setAttribute(attr, nextValue);
          } else {
            node.removeAttribute(attr);
          }
        }
      });
    }

    function handleAriaExpandedAttribute(): void {
      if (hasAriaExpanded || !instance.props.aria.expanded) {
        return;
      }

      const nodes = normalizeToArray(
        instance.props.triggerTarget || instance.reference
      );

      nodes.forEach((node) => {
        if (instance.props.interactive) {
          node.setAttribute(
            'aria-expanded',
            instance.state.isVisible &&
              node === (instance.state.currentTarget || instance.reference)
              ? 'true'
              : 'false'
          );
        } else {
          node.removeAttribute('aria-expanded');
        }
      });
    }

    return {
      onMount() {
        handleAriaContentAttribute();
        handleAriaExpandedAttribute();
      },
      onHide() {
        handleAriaContentAttribute();
        handleAriaExpandedAttribute();
      },
      onTrigger() {
        handleAriaExpandedAttribute();
      },
      onAfterUpdate() {
        handleAriaExpandedAttribute();
      },
    };
  },
};

export default aria;
