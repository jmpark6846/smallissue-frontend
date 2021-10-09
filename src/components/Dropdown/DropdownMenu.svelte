<script>
  export let id=null;
  export let width=null;
  let menuEl;

  function handleClick(){
    menuEl.blur();
  }
</script>

<div class={`bg-white rounded-lg shadow py-2 min-w-40 ${width ? width : ""} text-sm`} bind:this={menuEl} {id} on:click={handleClick} >
  <slot />
</div>
