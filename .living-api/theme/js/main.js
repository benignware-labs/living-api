import turbolinks from 'turbolinks';
//import 'highlight.js/styles/solarized-dark.css';
import 'highlight.js/styles/atom-one-dark-reasonable.css';

//
if (turbolinks && (!turbolinks.controller || !turbolinks.controller.started)) {
  turbolinks.start();
}

document.addEventListener('turbolinks:load', function() {
  // Turbolinks page load
  console.log('turbolinks load');
  console.log('href', window.location.href);

  const links = [ ...document.querySelectorAll(`.ld-Menu a[href]`) ];

  links.forEach(({ classList, href }) => classList.toggle('is-active', href === window.location.href));
  console.log('links', activeLinks);

  /*const activeLinks = document.querySelectorAll(`a[href="${window.location.href}"]`);

  console.log('activeLinks', activeLinks);*/
});


document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM READY');
  const sidebar = document.querySelector('.ld-Frame-sidebar');
  console.log('href', window.location.href);
  //document.documentElement.appendChild(sidebar);
})


window.addEventListener('popstate', () => {
  console.log('HELLO OPO');
});
