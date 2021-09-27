<script>
import { navigate, Route } from "svelte-routing";
import user from "../store/user";

export let path;
export let component;

$: if(!$user){
  console.log($user)
  navigate('/login');
}
</script>

<Route path>
{#if $user}
  <component />
{/if}
</Route>