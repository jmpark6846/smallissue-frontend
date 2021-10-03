<script>
import DOMPurify from "dompurify";
import { createEventDispatcher } from "svelte";


export let id;
export let placeholder = "내용을 입력해주세요."
export let content = "";
let element;
let status = { editing: false };
const dispatch = createEventDispatcher()

function edit(){
  dispatch('click');
  editing = true;
}

function save(){
  dispatch('save', { status });
}
</script>
<div>
  <div id={id} bind:this={element} class='p-1 hover:bg-gray-100 cursor-pointer rounded-md overflow -ml-1' on:click={edit}>
    {@html content ? DOMPurify.sanitize(content) : `<div class='text-gray-500'>${placeholder}</div>`}
  </div>
  
  {#if editing }
  <div class="flex flex-row mt-2 gap-2">
    <button class='btn-primary' on:save>저장</button>
    <button class='btn-outline' on:cancel>취소</button>
  </div>
  {/if}      
</div>