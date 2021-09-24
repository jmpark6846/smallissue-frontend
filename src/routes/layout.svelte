<script>
  import Header from "$components/header.svelte";
</script>
  
<Header />
<main class='flex flex-row h-full'>
  <div class='w-full bg-gray-100'>
    <slot />
  </div>
</main>
