<script>
import { createEventDispatcher } from "svelte";
export let value;

const dispatch = createEventDispatcher()
let item;

function handleClick(){
  const index = Array.from(item.parentElement.children).findIndex(i => i == item);
  const data = { index }

  if(value !== undefined){
    data.value = value
  }
  dispatch('click', data)
  item.blur();
}
</script>

<span bind:this={item} on:click={handleClick} tabindex={1} class="text-gray-700 hover:bg-gray-100 flex justify-between w-full px-4 py-2 text-sm leading-5 text-left cursor-pointer"  role="menuitem" ><slot /></span>  
  