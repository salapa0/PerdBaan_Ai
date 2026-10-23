// App entry. Owner: A (frontend). Replace this with the real boot order from docs/prototype-build-spec.md.
import { EMPTY_INTAKE } from './data/shapes.js';

const phone = document.querySelector('#phone');
phone.textContent = 'App is running. Build the LINE-style chat here.';
console.log('Starter ready', EMPTY_INTAKE);
