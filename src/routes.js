import index from '$routes/index.svelte';
import projects from '$routes/projects.svelte';

const routes = {
  '/': index,
  '/projects': projects,
  // '/login': login
  // '/products/:id': ProductDetail,
  // '/signup': Signup
}

export default routes;