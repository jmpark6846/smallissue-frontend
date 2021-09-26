<script>
import { Router, Route } from 'svelte-routing';
import Index from './routes/index.svelte';
import Layout from "./routes/layout.svelte";
import Login from './routes/login.svelte';
import User from './routes/user.svelte';
import Issue from './routes/projects/detail/index.svelte'
import ProjectList from './routes/projects/list.svelte';
import './global.css'
</script>

<Layout>
	<Router>
		<Route path='/login' component={Login} />
		<Route path='/issues' component={Issue} />
		<Route path='/projects' component={ProjectList} />
		<Route path='/user' component={User} />
		<Route path='/' component={Index} />
	</Router>
</Layout>
<style global>
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";
@import "./global.css";

html, body, #svelte {
  height: 100%;
}

</style>