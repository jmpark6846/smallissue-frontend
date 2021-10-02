<script>
import EditorJS from '@editorjs/editorjs';
import List from '@editorjs/list'; 
import debounce from 'lodash/debounce'

import { onMount } from 'svelte';


import Dropdown from '../components/Dropdown/Dropdown.svelte';
import DropdownButton from '../components/Dropdown/DropdownButton.svelte';
import DropdownItem from '../components/Dropdown/DropdownItem.svelte';
import DropdownMenu from '../components/Dropdown/DropdownMenu.svelte';
  
let styles = ['btn label', 'btn-blue label', 'btn-green label'];
function handleButtonClick(e){
  console.log('button!')
}

function handleClick(e){
  console.log(e.detail.index)
}

let editor;
let content="<h1>helllooooo~!</h1>"
function tinymceloaded() {
    window.tinymce.init({
    selector: 'div#editor',
    menubar: false,
    statusbar: false,
    setup: function(editor) {
      editor.on('init', function(e) {
        console.log('The Editor has initialized.');
      });
      editor.on('input', debounce(function(e){
        const content = editor.getContent()
        console.log(content)
      }, 300));
      editor.on('blur', function(e){
        console.log('blurrred!')
      })
    }
  })
}
</script>
<svelte:head>
  <script src="https://cdn.tiny.cloud/1/hc0aj9chontfnpqrhoue1ms95l96pb9tcm1uroo8447dr9ek/tinymce/5/tinymce.min.js" referrerpolicy="origin" on:load={tinymceloaded}></script>
</svelte:head>

<Dropdown>
  <DropdownButton on:click={handleButtonClick} style={styles[1]}>
    drop
    <svg class="w-5 h-5 ml-2 -mr-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
  </DropdownButton>
  <DropdownMenu>
    <DropdownItem on:click={handleClick}>hi</DropdownItem>
    <DropdownItem on:click={handleClick}>hi</DropdownItem>
    <DropdownItem on:click={handleClick}>hi</DropdownItem>
  </DropdownMenu>
</Dropdown>
  

<div >tinymce</div>
<!-- <div id="editor">
  {@html content}
</div> -->



<textarea class="w-64 border mx-auto"/>
    
