import { createPopper } from '@popperjs/core';

// // Toggle target elements using [data-collapse-toggle]
// document.querySelectorAll('[data-collapse-toggle]').forEach(function (collapseToggleEl) {
//     var collapseId = collapseToggleEl.getAttribute('data-collapse-toggle');
//     var collapseEl = document.getElementById(collapseId);

//     collapseToggleEl.addEventListener('click', function() {
//         if (collapseEl.classList.contains("hidden")) {
//             collapseEl.classList.remove("hidden");
//         } else {
//             collapseEl.classList.add("hidden");
//         }
//     });
// });


document.querySelectorAll('[data-dropdown-toggle]').forEach(function (dropdownToggleEl) {
  var dropdownMenuId = dropdownToggleEl.getAttribute('data-dropdown-toggle');
  var dropdownMenuEl = document.getElementById(dropdownMenuId);

  dropdownToggleEl.addEventListener('click', function (event) {
      console.log('object')
      var element = event.target;
      while (element.nodeName !== "BUTTON") {
          element = element.parentNode;
      }
      createPopper(element, dropdownMenuEl, {
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

      // toggle when click on the button
      dropdownMenuEl.classList.toggle("hidden");
      dropdownMenuEl.classList.toggle("block");

      function handleDropdownOutsideClick(event) {
          var targetElement = event.target; // clicked element
          if (targetElement !== dropdownMenuEl && targetElement !== dropdownToggleEl && !dropdownToggleEl.contains(targetElement)) {
              dropdownMenuEl.classList.add("hidden");
              dropdownMenuEl.classList.remove("block");
              document.body.removeEventListener('click', handleDropdownOutsideClick, true);
          }
      }

      // hide popper when clicking outside the element
      document.body.addEventListener('click', handleDropdownOutsideClick, true);
  });
});