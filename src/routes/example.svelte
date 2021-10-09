<script>
import  { createPopper } from '@popperjs/core'
import Dropdown from '../components/Dropdown/Dropdown.svelte';
import DropdownMenu from '../components/Dropdown/DropdownMenu.svelte';
const popperOptions = {
  placement: 'bottom-start',
  modifiers: [
    { name: 'offset', options: { offset: [0, 10] } }
  ],
};

export let dropdownToggleSelector

let dropdownToggleEl;
let dropdownMenuEl;



function handleDropdownToggleClick(e){
  createPopper(dropdownToggleEl, dropdownMenuEl, {
      placement: 'bottom-start',
      modifiers: [
          {
              name: 'offset',
              options: {
                  offset: [0, 10],
              },
          },
      ]
  });
  dropdownMenuEl.classList.toggle("hidden");
  dropdownMenuEl.classList.toggle("block");

  document.body.addEventListener('click', handleDropdownOutsideClick, true);
}

function handleDropdownOutsideClick(event) {
    var targetElement = event.target; // clicked element
    console.log(targetElement)
    console.log(targetElement !== dropdownMenuEl, targetElement !== dropdownToggleEl, !dropdownToggleEl.contains(targetElement), targetElement !== dropdownMenuEl && targetElement !== dropdownToggleEl && !dropdownToggleEl.contains(targetElement))
    if (targetElement !== dropdownMenuEl && targetElement !== dropdownToggleEl && !dropdownToggleEl.contains(targetElement)) {
        dropdownMenuEl.classList.add("hidden");
        dropdownMenuEl.classList.remove("block");
        document.body.removeEventListener('click', handleDropdownOutsideClick, true);
    }
}
</script>

<Dropdown menu={'dropdown'}>
  <button class='rounded-lg px-4 py-2 bg-blue-100 hover:bg-blue-200 focus:bg-blue-300 text-blue-500 hover:text-blue-700'>누르기</button>
</Dropdown>
<DropdownMenu id='dropdown'>
  <div class='card'>
    <div class='px-4 py-2  hover:bg-blue-200'>메뉴1</div>
    <div class='px-4 py-2  hover:bg-blue-200'>메뉴1</div>
    <div class='px-4 py-2  hover:bg-blue-200'>메뉴1</div>
    
  </div>
</DropdownMenu>