<script>
import { Router, Route } from 'svelte-navigator';
import PrivateRoute from './components/PrivateRoute/PrivateRoute.svelte';
import Index from './routes/index.svelte';
import Layout from "./routes/layout.svelte";
import Login from './routes/login.svelte';
import User from './routes/user.svelte';
import Issue from './routes/projects/detail/DetailList.svelte'
import ProjectList from './routes/projects/list.svelte';
import ProjectDetailList from './routes/projects/detail/DetailList.svelte'
import Example from './routes/example.svelte';
</script>
<svelte:head>
	<script src="https://cdn.tiny.cloud/1/hc0aj9chontfnpqrhoue1ms95l96pb9tcm1uroo8447dr9ek/tinymce/5/tinymce.min.js" referrerpolicy="origin" ></script>
</svelte:head>
<Router>
	<Layout>
		<Route path='/login' component={Login} />
		<Route path='/issues' component={Issue} />
		<Route path='/example' component={Example} />
		<PrivateRoute path="projects/:id/list" let:location>
			<ProjectDetailList />
		</PrivateRoute>
		<PrivateRoute path="projects" let:location>
			<ProjectList />
		</PrivateRoute>

		<Route path='/user' component={User} />
		<Route path='/' component={Index} />
	</Layout>
</Router>

<style global>
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";
@import "./global.css";

html, body, #svelte {
  height: 100%;
}

</style>