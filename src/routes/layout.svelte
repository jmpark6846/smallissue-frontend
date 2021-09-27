<script>
import Header from "$components/header.svelte";
</script>
  
<Header />
<main class='flex flex-row h-full bg-gray-50'>
  <div class='w-full max-w-8xl ml-auto mr-auto'>
    <slot />
  </div>  
</main>
