<script>
import Router from 'svelte-spa-router';
import routes from './routes';
import Layout from "./routes/layout.svelte";
</script>

<Layout>
	<Router {routes} />
</Layout>
<style global>
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>