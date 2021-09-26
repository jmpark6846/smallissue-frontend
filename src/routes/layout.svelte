<script>
import Header from "$components/header.svelte";
</script>
  
<Header />
<main class='flex flex-row h-full'>
  <div class='w-full bg-gray-50'>
    <slot />
  </div>
</main>
