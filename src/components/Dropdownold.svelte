<script>
import { createEventDispatcher } from 'svelte';

export let menus = []; // { label, value, btnClass }
export let label = "";
export let reset = false;
export let right = false;
$: selected = menus.find(m => m.label === label)
$: {
  if(String(label)){
    console.log('string')
  }else{
    console.log('not string')
  }
}
let open = false;
const dispatch = createEventDispatcher()

function handleButtonClick(e){
  dispatch('button-click');
  open = true;
}

function handleClick(index){
  dispatch('select', { value: index });
  open = false;
}

</script>
<div class="relative inline-block text-left dropdown">
  <span class="rounded-md">
    <button on:click={handleButtonClick} 
      class={`max-w-full inline-flex justify-center btn dropdown-button ${selected ? selected.btnClass : ""}`}
      type="button" aria-haspopup="true" aria-expanded="true">
      <span>{label}</span>
      <svg class="w-5 h-5 ml-2 -mr-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
    </button>
  </span>
  {#if open }
  <div class="opacity-0 invisible dropdown-menu transform origin-top-right -translate-y-2 scale-95">
    <div class={`absolute ${ right ? 'right-0 origin-top-right' : 'left-0 origin-top-left' } w-48 mt-2  bg-white border shadow-sm border-gray-200 divide-y divide-gray-100 rounded-md outline-none`} role="menu">
      {#if menus.length === 0 }
        <div>loading..</div>
      {:else}
      <div class="py-1">
        {#if reset}
          <span on:click={()=>handleClick(null)} tabindex={0} class="text-gray-700 hover:bg-blue-50 flex justify-between w-full px-4 py-2 text-sm leading-5 text-left cursor-pointer"  role="menuitem">해제</span>    
        {/if}
        {#each menus as menu, index (index)}
          <span on:click={()=>handleClick(index)} tabindex={index+1} class="text-gray-700 hover:bg-blue-50 flex justify-between w-full px-4 py-2 text-sm leading-5 text-left cursor-pointer"  role="menuitem" >{menu.label}</span>  
        {/each}
      </div>
      {/if}
    </div>
  </div>
  {/if}
</div>
  
<style>
.dropdown:focus-within .dropdown-menu {
  opacity:1;
  transform: translate(0) scale(1);
  visibility: visible;
}

</style>