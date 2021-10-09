<script>
import { navigate } from "svelte-navigator";
import user from "../store/user";

if( user ){
  navigate("/projects", { replace: true });
}else{
  navigate("/login")
}

</script>
<svelte:head>
  <title>smallissue</title>
</svelte:head>
