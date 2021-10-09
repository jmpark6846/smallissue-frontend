import { writable } from "svelte/store";



const user = writable(localStorage.user ? JSON.parse(localStorage.user) : null);
user.subscribe((value)=> localStorage.user = JSON.stringify(value));

export const notification = writable({
  unread_count: 0,
  unread_list: []
})
export default user;

