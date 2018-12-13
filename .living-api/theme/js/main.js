import turbolinks from 'turbolinks';
//import 'highlight.js/styles/solarized-dark.css';
import 'highlight.js/styles/atom-one-dark-reasonable.css';

//
if (turbolinks && (!turbolinks.controller || !turbolinks.controller.started)) {
  turbolinks.start();
}

function updateTargets(nextDocument, selector, callback) {
  selector = `${selector}[data-target]`;

  // Create a map of targets
  const nextTargets = Object.assign(
    {},
    ...[ ...nextDocument.querySelectorAll(selector) ].map(target => ({
      [target.getAttribute('data-target')]: target
    }))
  )

  // Update targets
  [ ...document.querySelectorAll(selector) ]
    .map(target => ([ target, nextTargets[target.getAttribute('data-target')] ]))
    .forEach(([ target, nextTarget ]) => callback(target, nextTarget));
}


document.addEventListener('turbolinks:request-end', function(event) {
  // Turbolinks page load
  const nextDocument = (new DOMParser()).parseFromString(event.data.xhr.responseText, 'text/html');

  updateTargets(nextDocument, '.ld-Menu-item', (target, nextTarget) => {
    const toggle = target.querySelector('.ld-Dropdown-toggle');
    const nextToggle = nextTarget.querySelector('.ld-Dropdown-toggle');

    if (toggle && nextToggle) {
      toggle.checked = nextToggle.checked;
    }
  });
});

document.addEventListener('turbolinks:load', function(...args) {
  // Turbolinks page load
  const links = [ ...document.querySelectorAll(`.ld-Menu a[href]`) ];

  links.forEach(({ classList, href }) => classList.toggle('is-active', href === window.location.href));
});
