import index from './routes/index.svelte';
import projects from './routes/projects.svelte';
import login from './routes/login.svelte'

const routes = {
  '/': index,
  '/projects': projects,
  '/login': login
  // '/products/:id': ProductDetail,
  // '/login': Login,
  // '/signup': Signup
}

export default routes;