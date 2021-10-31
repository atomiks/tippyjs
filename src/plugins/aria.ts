import {Plugin, Props} from '../types';
import {normalizeToArray} from '../utils';

const ARIA_EXPANDED = 'aria-expanded';

interface Aria extends Plugin {
  name: 'aria';
  defaultValue: {
    content: 'auto';
    expanded: 'auto';
    role: 'tooltip';
  };
}

function computeAriaPropValue({aria, interactive}: Props) {
  return {
    expanded: aria.expanded === 'auto' ? interactive : aria.expanded,
    content:
      aria.content === 'auto'
        ? interactive
          ? null
          : 'describedby'
        : aria.content,
    role: aria.role,
  };
}

const aria: Aria = {
  name: 'aria',
  defaultValue: {
    content: 'auto',
    expanded: 'auto',
    role: 'tooltip',
  },
  fn(instance) {
    let prevProps = instance.props;

    const hasAriaExpandedOnCreate = instance.reference.hasAttribute(
      ARIA_EXPANDED
    );
    handleAriaExpandedAttribute();

    function handleRoleAttribute(): void {
      if (instance.props.aria.role) {
        instance.popper.setAttribute('role', instance.props.aria.role);
      } else {
        instance.popper.removeAttribute('role');
      }
    }

    function handleAriaContentAttribute(): void {
      const aria = computeAriaPropValue(instance.props);

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
      const aria = computeAriaPropValue(instance.props);

      if (hasAriaExpandedOnCreate || !aria.expanded) {
        return;
      }

      const nodes = normalizeToArray(
        instance.props.triggerTarget || instance.reference
      );

      nodes.forEach((node) => {
        if (instance.props.interactive) {
          node.setAttribute(
            ARIA_EXPANDED,
            instance.state.isVisible &&
              node === (instance.state.currentTarget || instance.reference)
              ? 'true'
              : 'false'
          );
        } else {
          node.removeAttribute(ARIA_EXPANDED);
        }
      });
    }

    function handleAriaUpdate(prevProps: Props, nextProps: Props) {
      if (prevProps.triggerTarget && !nextProps.triggerTarget) {
        normalizeToArray(prevProps.triggerTarget).forEach((node) => {
          node.removeAttribute(ARIA_EXPANDED);
        });
      } else if (nextProps.triggerTarget) {
        instance.reference.removeAttribute(ARIA_EXPANDED);
      }
    }

    return {
      onCreate() {
        handleRoleAttribute();
      },
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
      onBeforeUpdate() {
        prevProps = instance.props;
      },
      onAfterUpdate() {
        handleAriaExpandedAttribute();
        handleRoleAttribute();
        handleAriaUpdate(prevProps, instance.props);
      },
    };
  },
};

export default aria;
