<script>
  import { createEventDispatcher} from 'svelte'
  export let primary = false;
  const dispatch = createEventDispatcher()

  function onClick(){
    dispatch('click');
  }
</script>

<button class='border rounded-md space-x-3 font-medium px-6 py-2' 
  class:bg-primary={primary}
  class:text-white={primary}

  on:click={onClick}
>
  <slot/>
</button>