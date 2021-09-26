<script>
export let open;
export let modal;
export let toggle;

window.onclick = function(event) {

  if (event.target == modal) {
    toggle();
  }
}
</script>

<div bind:this={modal} 
  class="main-modal modal-bg opacity-0 fixed w-full h-100 inset-0 z-50 overflow-hidden flex justify-center animated faster"
  class:fadeIn={open}
  class:z-50={open} 
  class:-z-50={!open}
  class:hidden={!open}>
  <div class="w-11/12 md:max-w-md mx-auto rounded-lg bg-white border border-gray-300  fixed top-10" >  
    <slot />
  </div>
</div>


<style>
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