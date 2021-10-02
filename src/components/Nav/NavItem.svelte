<script>
import { createEventDispatcher, getContext } from 'svelte';
export let target;
export let active = false;
export let href;
export let style = 'tabs';

let item;
const tabpanelsId = getContext('tabpanels');
const dispatch = createEventDispatcher()

function handleClick(){
  dispatch('click');
  if(tabpanelsId && target){
    const tabpanels = document.getElementById(tabpanelsId);
    const panels = Array.from(tabpanels.children);
  
    panels.forEach(panel => {
      if(panel.id === target){
        panel.classList.add('active');
        panel.classList.remove('hidden');
      }else{
        panel.classList.add('hidden');
        panel.classList.remove('active');
      }
    });


    const navItems = Array.from(item.parentElement.children);
    navItems.forEach(item => {
      
      if(item.getAttribute('target') === target){
        item.classList.add('active');
      }else{
        item.classList.remove('active');
      }
    })
  }
}

</script>
<li class={`nav-item ${style}`} target={target}  class:active={active} bind:this={item} on:click={handleClick}>
  {#if href }
    <a class='nav-link' href='#'><slot /></a>
  {:else}
    <slot/>
  {/if}
</li>