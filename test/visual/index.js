const containers = document.querySelectorAll('.container');

containers.forEach((container) => {
  const button = document.createElement('button');

  button.textContent = container.id;
  button.className = 'link';
  button.setAttribute('data-id', container.id);

  document.querySelector('#controls').appendChild(button);

  button.onclick = () => {
    hide();

    state.currentTest = container.id;

    show();
    run();

    window.location.hash = container.id;
  };
});

function hide() {
  const container = document.getElementById(state.currentTest);
  const button = document.querySelector(
    `button[data-id="${state.currentTest}"]`
  );

  if (container) {
    container.style.display = 'none';
    button.removeAttribute('data-current');
  }
}

function show() {
  const container = document.getElementById(state.currentTest);
  const button = document.querySelector(
    `button[data-id="${state.currentTest}"]`
  );

  if (container) {
    container.style.display = 'grid';
    button.setAttribute('data-current', '');
  }
}

function run() {
  if (window.cleanup) {
    window.cleanup();
  }

  window.cleanup = state.tests[state.currentTest]();
}

const initialTestId = window.location.hash
  ? window.location.hash.split('#')[1]
  : 'default';

document.querySelector(`button[data-id="${initialTestId}"]`).click();
