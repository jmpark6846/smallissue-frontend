<script>
  import DOMPurify from 'isomorphic-dompurify';
  import { createEventDispatcher } from 'svelte';
  export let content;
  let contentBefore="";
  let slot = null;
  let editing = false;  
  
  const dispatch = createEventDispatcher();

  function handleChange(){
    dispatch('change', { value: textarea.value })
  }
  function handleKeypress(e){
    if(e.keyCode === 13){
      handleBlur()
    }
  }
  function handleClick(){
    editing = true;
  }
  
  $: {
    if(slot){
      slot.focus()
    } 
  }
  
  function handleFocus(){
    contentBefore = textarea.value;
  }
  
  function handleBlur(){
    if(slot.value !== contentBefore){
      dispatch('blur', {value: slot.value});
    }
    editing=false;
  }
  </script>
  
  {#if editing}
    <slot />
    <textarea bind:this={textarea} oninput='this.style.height = "";this.style.height = this.scrollHeight + 3 + "px";'
    class='w-full textarea p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none' name="modalissue-title" spellcheck={false}
    on:change={handleChange} on:keypress={handleKeypress} on:focus={handleFocus} on:blur={handleBlur} >{content}</textarea>
  {:else}
    <div class='content p-2 hover:bg-gray-100 cursor-pointer rounded-md min-h-10 overflow' on:click={handleClick}>
      {@html DOMPurify.sanitize(content)}
    </div> 
  {/if}
  
  <style>
    .textarea{
      font-weight: inherit;
    }
    .content {
      overflow-wrap: break-word;
    }
  </style>