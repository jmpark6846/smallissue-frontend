<script>
export let open;
export let modal;
export let toggle;
export let wide;
export let heightFull;


window.onclick = function(event) {
  if (event.target == modal) {
    toggle();
  }
}

</script>

<div 
  bind:this={modal} 
  class={`main-modal modal-bg shadow-lg flex items-center opacity-0 fixed inset-0 z-50 overflow-hidden flex justify-center animated faster ${ open ? 'fadeIn z-50' : '-z-50 hidden'}`}>
  <div class={`${wide ? "wide" : ""} modal-section mx-auto rounded-lg bg-white border border-gray-300  fixed `}>  
    <slot />
  </div>
</div>


<style>
  .modal-section { 
    overflow:auto;
  }
  .modal-section.wide{
    width: 100%;
    height: 100%;
  }
  @media (min-width: 1024px) {
    .modal-section.wide{
      width: calc(100% - 25rem);
      height: calc(100% - 10rem);
    }
  }
  @media (min-width: 1280px) {
    /* .modal-section.wide{
      width: calc(100% - 50rem);
      height: calc(100% - 10rem);
    } */
  }
  
  .modal-bg {
    background-color: rgba(0,0,0,0.5);
  }


  .animated {
    -webkit-animation-duration: 1s;
    animation-duration: 1s;
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both;
  }

  .animated.faster {
    -webkit-animation-duration: 200ms;
    animation-duration: 200ms;
  }

  .fadeIn {
    -webkit-animation-name: fadeIn;
    animation-name: fadeIn;
  }

  .fadeOut {
    -webkit-animation-name: fadeOut;
    animation-name: fadeOut;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }

    to {
      opacity: 0;
    }
  }

</style>