<script>
  export let right = false;
  export let width = 'w-48';
</script>
<div class="opacity-0 invisible dropdown-menu transform origin-top-right -translate-y-2 scale-95">
  <div class={`absolute ${ right ? 'right-0 origin-top-right' : 'left-0 origin-top-left' } ${width} mt-1  bg-white border shadow-sm border-gray-200 divide-y divide-gray-100 rounded-md outline-none`} role="menu">
    <div class="py-1">
      <slot />
    </div>
  </div>
</div>

