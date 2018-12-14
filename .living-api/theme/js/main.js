import turbolinks from 'turbolinks';
//import 'highlight.js/styles/solarized-dark.css';
import 'highlight.js/styles/atom-one-dark-reasonable.css';

[ ...document.querySelectorAll('*[data-chrome]') ].forEach(element => {
  document.documentElement.appendChild(element, document.body);
});

window.addEventListener('click', (event) => {
  const target = event.target.closest('*[data-href]');
  if (target) {
    const href = `/${target.getAttribute('data-href')}`;

    if (href !== window.location.pathname) {
      Turbolinks.visit(href);
    }
  }

  event.stopPropagation();
});

//
if (turbolinks && (!turbolinks.controller || !turbolinks.controller.started)) {
  turbolinks.start();
}
/*
function updateTargets(nextDocument, selector, callback) {

  selector = `${selector}[data-target]`;

  const nodes = [ ...nextDocument.querySelectorAll(selector) ];

  // Create a map of targets
  const nextTargets = Object.assign(
    {},
    ...nodes.map(target => ({
      [target.getAttribute('data-target')]: target
    }))
  );

  // Update targets
  [ ...document.querySelectorAll(selector) ]
    .map(target => ([ target, nextTargets[target.getAttribute('data-target')] ]))
    .forEach(([ target, nextTarget ]) => callback(target, nextTarget));

}
*/
/*
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
});*/

/*
const links = [ ...document.querySelectorAll('.ld-Frame-sidebar a[href]') ];

console.log('links', links);

links.forEach(link => {
  console.log('link', link);
  link.onclick = (e) => {
    console.log('VISIT');
    Turbolinks.visit(e.currentTarget.href);
  }
})
*/


document.addEventListener('turbolinks:load', function(...args) {
  const links = [ ...document.querySelectorAll(`[data-href]`) ];

  links.forEach(input => {
    const pathname = `/${input.getAttribute('data-href')}`;
    input.nextElementSibling && input.nextElementSibling.classList.toggle('is-active', pathname === window.location.pathname);
  })

});

document.addEventListener('turbolinks:before-render', function(event) {
  // Turbolinks page load
  [ ...event.data.newBody.querySelectorAll('*[data-chrome]') ].forEach(element => {
    element.parentNode.removeChild(element);
  });
});
