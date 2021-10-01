<script>
  export let style="btn";
</script>

<button on:click
  type="button" aria-haspopup="true" aria-expanded="true"
  class={`dropdown-button inline-flex justify-center items-center ${style}`}>
  <slot />
</button>
