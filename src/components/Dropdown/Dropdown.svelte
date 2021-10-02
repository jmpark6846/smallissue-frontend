<script>
  export let z = 50;
</script>
<div class={`relative inline-block text-left dropdown`} style={`z-index: ${z}`}>
  <slot />
</div>