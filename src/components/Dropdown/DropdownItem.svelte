<script>
import { createEventDispatcher } from "svelte";

const dispatch = createEventDispatcher()
let item;
function handleClick(){
  const index = Array.from(item.parentElement.children).findIndex(i => i == item);
  dispatch('click', { index })
  item.blur();
}
</script>

<span bind:this={item} on:click={handleClick} tabindex={1} class="text-gray-700 hover:bg-gray-100 flex justify-between w-full px-4 py-2 text-sm leading-5 text-left cursor-pointer"  role="menuitem" ><slot /></span>  
  