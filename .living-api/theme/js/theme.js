import turbolinks from 'turbolinks';
//import 'highlight.js/styles/solarized-dark.css';
//
if (turbolinks && (!turbolinks.controller || !turbolinks.controller.started)) {
  turbolinks.start();
}

document.addEventListener('turbolinks:load', function() {
  // Turbolinks page load
});
