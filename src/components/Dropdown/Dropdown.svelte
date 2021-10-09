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
        // arrow: roundArrow,
        placement: 'bottom-end',
        content(reference){
            let el = document.getElementById(menu);
            if(el === null){
                el = reference.nextElementSibling;
            }
            return el
        },
        trigger: 'click',
        interactive:true,
        on(instance, event) {
            console.log(instance, event)
        },
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
