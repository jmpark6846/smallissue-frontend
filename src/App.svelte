<script>
import { Router, Route } from 'svelte-routing';
import Index from './routes/index.svelte';
import Layout from "./routes/layout.svelte";
import Login from './routes/login.svelte';
</script>

<Layout>
	<Router>
		<Route path='/login' component={Login} />
		<Route path='/' component={Index} />
	</Router>

</Layout>
<style global>
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #svelte {
  height: 100%;
}

</style>