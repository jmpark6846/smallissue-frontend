<script>
import DOMPurify from 'isomorphic-dompurify';
import { createEventDispatcher } from 'svelte';
export let content;
export let html=false;
let valueBefore="";
let textarea = null;
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
  if(textarea){
    textarea.focus()
  } 
}

function handleFocus(){
  valueBefore = textarea.value;
}

function handleBlur(){
  if(textarea.value !== valueBefore){
    console.log(textarea.value)
    console.log(DOMPurify.sanitize(content))
    dispatch('blur', {value: textarea.value});
  }
  editing=false;
}
</script>

{#if editing}
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