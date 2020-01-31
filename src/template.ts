import {
  BOX_CLASS,
  CONTENT_CLASS,
  ARROW_CLASS,
  SVG_ARROW_CLASS,
  BACKDROP_CLASS,
} from './constants';
import {PopperElement, PopperChildren, Props, Instance} from './types';
import {div, isElement} from './dom-utils';
import {arrayFrom} from './utils';

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

export function setContent(
  content: HTMLDivElement,
  {props, reference}: Instance,
): void {
  const computedContent =
    typeof props.content === 'function'
      ? props.content(reference)
      : props.content;

  if (isElement(computedContent)) {
    dangerouslySetInnerHTML(content, '');
    content.appendChild(computedContent);
  } else {
    if (props.allowHTML) {
      dangerouslySetInnerHTML(content, computedContent);
    } else {
      content.textContent = computedContent;
    }
  }
}

export function getChildren(popper: PopperElement): PopperChildren {
  const box = popper.firstElementChild as HTMLDivElement;
  const boxChildren = arrayFrom(box.children);

  return {
    box,
    content: boxChildren.find(node => node.classList.contains(CONTENT_CLASS)),
    arrow:
      boxChildren.find(
        node =>
          node.classList.contains(ARROW_CLASS) ||
          node.classList.contains(SVG_ARROW_CLASS),
      ) || null,
    backdrop:
      boxChildren.find(node => node.classList.contains(BACKDROP_CLASS)) || null,
  };
}

export function render(
  instance: Instance,
): {
  popper: PopperElement;
  update?: (prevProps: Props, nextProps: Props) => void;
} {
  const popper = div();

  const box = div();
  box.className = BOX_CLASS;
  box.setAttribute('data-state', 'hidden');
  box.setAttribute('tabindex', '-1');

  const content = div();
  content.className = CONTENT_CLASS;
  content.setAttribute('data-state', 'hidden');

  setContent(content, instance);

  popper.appendChild(box);
  box.appendChild(content);

  update(instance.props, instance.props);

  function update(prevProps: Props, nextProps: Props): void {
    const {box, content, arrow} = getChildren(popper);

    popper.style.zIndex = `${nextProps.zIndex}`;

    if (nextProps.theme) {
      box.setAttribute('data-theme', nextProps.theme);
    } else {
      box.removeAttribute('data-theme');
    }

    if (nextProps.animation) {
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

    if (prevProps.content !== nextProps.content) {
      setContent(content, instance);
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
    update,
  };
}

// Runtime check to identify if the render function is the default one; this
// way we can apply default CSS transitions logic and it can be tree-shaken away
render.$$tippy = true;

export function isDefaultRenderFn(render: any): boolean {
  // @ts-ignore
  return render.$$tippy;
}
