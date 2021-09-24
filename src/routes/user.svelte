<script>
import { onMount } from "svelte";
import api from "../utils/api.js";

onMount(async () => {
  const res = await api.get('accounts/user/');
  console.log(res)
})
</script>