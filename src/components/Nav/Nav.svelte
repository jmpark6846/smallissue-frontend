<script>
import{ setContext } from 'svelte';
export let tabpanels;

if(tabpanels){
  setContext('tabpanels', tabpanels)
}

</script>
<ul class='nav flex flex-row gap-2'>
  <slot />
</ul>