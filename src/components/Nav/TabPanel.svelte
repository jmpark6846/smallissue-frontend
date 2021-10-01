<script>
  export let id;
  export let active=false;
</script>
<div id={id} class='tabpanel' class:hidden={!active}>
  <slot />
</div>