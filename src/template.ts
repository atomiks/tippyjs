import {
  ARROW_CLASS,
  BACKDROP_CLASS,
  BOX_CLASS,
  CONTENT_CLASS,
  SVG_ARROW_CLASS,
} from './constants';
import {div, isElement} from './dom-utils';
import {Instance, PopperElement, Props} from './types';
import {PopperChildren} from './types-internal';
import {arrayFrom} from './utils';

// Firefox extensions don't allow .innerHTML = "..." property. This tricks it.
const innerHTML = (): 'innerHTML' => 'innerHTML';

function dangerouslySetInnerHTML(element: Element, html: string): void {
  element[innerHTML()] = html;
}

function createArrowElement(value: Props['arrow']): HTMLDivElement {
  const arrow = div();

  if (value === true) {
    arrow.className = ARROW_CLASS;
  } else {
    arrow.className = SVG_ARROW_CLASS;

    if (isElement(value)) {
      arrow.appendChild(value);
    } else {
      dangerouslySetInnerHTML(arrow, value as string);
    }
  }

  return arrow;
}

export function setContent(content: HTMLDivElement, props: Props): void {
  if (isElement(props.content)) {
    dangerouslySetInnerHTML(content, '');
    content.appendChild(props.content);
  } else if (typeof props.content !== 'function') {
    if (props.allowHTML) {
      dangerouslySetInnerHTML(content, props.content);
    } else {
      content.textContent = props.content;
    }
  }
}

export function getChildren(popper: PopperElement): PopperChildren {
  const box = popper.firstElementChild as HTMLDivElement;
  const boxChildren = arrayFrom(box.children);

  return {
    box,
    content: boxChildren.find((node) => node.classList.contains(CONTENT_CLASS)),
    arrow: boxChildren.find(
      (node) =>
        node.classList.contains(ARROW_CLASS) ||
        node.classList.contains(SVG_ARROW_CLASS)
    ),
    backdrop: boxChildren.find((node) =>
      node.classList.contains(BACKDROP_CLASS)
    ),
  };
}

export function render(
  instance: Instance
): {
  popper: PopperElement;
  onUpdate?: (prevProps: Props, nextProps: Props) => void;
} {
  const popper = div();

  const box = div();
  box.className = BOX_CLASS;
  box.setAttribute('data-state', 'hidden');
  box.setAttribute('tabindex', '-1');

  const content = div();
  content.className = CONTENT_CLASS;
  content.setAttribute('data-state', 'hidden');

  setContent(content, instance.props);

  popper.appendChild(box);
  box.appendChild(content);

  onUpdate(instance.props, instance.props);

  function onUpdate(prevProps: Props, nextProps: Props): void {
    const {box, content, arrow} = getChildren(popper);

    if (nextProps.theme) {
      box.setAttribute('data-theme', nextProps.theme);
    } else {
      box.removeAttribute('data-theme');
    }

    if (typeof nextProps.animation === 'string') {
      box.setAttribute('data-animation', nextProps.animation);
    } else {
      box.removeAttribute('data-animation');
    }

    if (nextProps.inertia) {
      box.setAttribute('data-inertia', '');
    } else {
      box.removeAttribute('data-inertia');
    }

    box.style.maxWidth =
      typeof nextProps.maxWidth === 'number'
        ? `${nextProps.maxWidth}px`
        : nextProps.maxWidth;

    if (nextProps.role) {
      box.setAttribute('role', nextProps.role);
    } else {
      box.removeAttribute('role');
    }

    if (
      prevProps.content !== nextProps.content ||
      prevProps.allowHTML !== nextProps.allowHTML
    ) {
      setContent(content, instance.props);
    }

    if (nextProps.arrow) {
      if (!arrow) {
        box.appendChild(createArrowElement(nextProps.arrow));
      } else if (prevProps.arrow !== nextProps.arrow) {
        box.removeChild(arrow);
        box.appendChild(createArrowElement(nextProps.arrow));
      }
    } else if (arrow) {
      box.removeChild(arrow!);
    }
  }

  return {
    popper,
    onUpdate,
  };
}

// Runtime check to identify if the render function is the default one; this
// way we can apply default CSS transitions logic and it can be tree-shaken away
render.$$tippy = true;
