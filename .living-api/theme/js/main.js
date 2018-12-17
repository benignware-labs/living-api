import turbolinks from 'turbolinks';
//import 'highlight.js/styles/solarized-dark.css';
import 'highlight.js/styles/atom-one-dark-reasonable.css';

[ ...document.querySelectorAll('*[data-chrome]') ].forEach(element => {
  document.documentElement.appendChild(element, document.body);
});

window.addEventListener('click', (event) => {
  const target = event.target.closest('*[data-href]');
  if (target) {
    const href = `${target.getAttribute('data-href')}`;

    if (href !== window.location.pathname) {
      Turbolinks.visit(href);
    }
  }

  event.stopPropagation();
});

if (turbolinks && (!turbolinks.controller || !turbolinks.controller.started)) {
  turbolinks.start();
}

document.addEventListener('turbolinks:load', function(...args) {
  const links = [ ...document.querySelectorAll(`[data-href]`) ];

  links.forEach(input => {
    const pathname = `${input.getAttribute('data-href')}`;

    input.nextElementSibling && input.nextElementSibling.classList.toggle('is-active', pathname === window.location.pathname);
  })

});

document.addEventListener('turbolinks:before-render', function(event) {
  // Turbolinks page load
  [ ...event.data.newBody.querySelectorAll('*[data-chrome]') ].forEach(element => {
    element.parentNode.removeChild(element);
  });
});
