<script>
import { Router, Route } from 'svelte-routing';
import routes from './routes';
import Index from './routes/index.svelte';
import Layout from "./routes/layout.svelte";
import Login from './routes/login.svelte';

</script>

<Layout>
	<Router>
		<Route path='/' component={Index} />
		<Route path='/login' component={Login} />
	</Router>

</Layout>
<style global>
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>