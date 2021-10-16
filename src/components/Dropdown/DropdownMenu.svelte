<script>
import { onMount } from "svelte";


  export let id=null;
  export let width=null;
  let menuEl;
  let dropdownToggleEl;

  // onMount(()=>{
  //   if(menuEl){
  //     dropdownToggleEl = menuEl.previousElementSibling;
  //   }
  // });
  function handleClick(e){
    // dropdownToggleEl._tippy.hide();
  }
</script>

<div class={`bg-white rounded-lg shadow py-2 min-w-40 ${width ? width : ""} text-sm`} bind:this={menuEl} {id} on:click={handleClick} >
  <slot />
</div>
