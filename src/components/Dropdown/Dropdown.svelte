<script>
import tippy from 'tippy.js';
import 'tippy.js/dist/svg-arrow.css';
import { onMount } from 'svelte';

export let menu = null;
export let tippyOptions = {};
let dropdownToggleEl;

onMount(()=>{
    tippy(dropdownToggleEl, {
        duration: 0,
        arrow: true,
        hideOnClick: true,
        placement: 'bottom-end',
        content(reference){
            let el = document.getElementById(menu);
            if(el === null){
                el = reference.nextElementSibling;
            }
            el.addEventListener('click', (e)=>{
                dropdownToggleEl._tippy.hide();
            });
            return el
        },
        trigger: 'click',
        interactive:true,
        ...tippyOptions,
        
    })
})


</script>

<div class="inline-block" bind:this={dropdownToggleEl} on:click><slot/></div>


<style>
    :global(.tippy-svg-arrow svg){
      fill: white;
    }
  </style>
