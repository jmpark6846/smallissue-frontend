<script>
import { onMount } from 'svelte';
import dayjs from 'dayjs'
import { link, useNavigate, useLocation } from 'svelte-navigator';
import user, { notification } from '../store/user';
import api from '../utils/api';
import Dropdown from './Dropdown/Dropdown.svelte';
import DropdownMenu from './Dropdown/DropdownMenu.svelte';
import { project } from '../store';

const navigate = useNavigate();
const location = useLocation();
let isNotificationLoading = true;

async function notificationClick(id,to){
  try {
    await api.patch('accounts/notifications/mark_as_read/'+id+'/');
    notification.update(v=>({...v, unread_count: v.unread_count - 1}))
    navigate(to)
  } catch (error) {
    console.error(error);
  }
}

async function markAllAsRead(e){
  try{
    await api.patch('accounts/notifications/mark_all_as_read/');
    notification.set({
      unread_count: 0,
      unread_list: []
    });
  }catch(error){
    console.error(error);
  }
}
async function getUnreadNotifications(){
  notification.update(v=>({
    ...v,
    unread_list: []
  }));
  isNotificationLoading = true;
  try {
    const res = await api.get('accounts/notifications/unread/');
    notification.set(res.data)
    isNotificationLoading = false;
  } catch (error) {
    isNotificationLoading = false;
    if(error.response.status === 401){
      return;
    }
    throw new Error('에러가 발생했습니다.')
  }
}
function getUnreadCount(){
  return api.get('inbox/notifications/api/unread_count/');
}
onMount(async () => {
  if($user){
    const notiCountRes = await getUnreadCount();
    if(notiCountRes.status === 200){
      notification.update(v=>({...v, unread_count: notiCountRes.data.unread_count}));
    }
  }
})

async function logout(){
  const res = await api.post('accounts/logout/');
  if(res.status === 200){
    user.set(null);
    notification.set({
      unread_count: 0,
      unread_list: []
    });
    isNotificationLoading = true;
    const from = ($location.state && $location.state.from) || "/";
    navigate(from, { replace: true });
  }else{
    throw new Error('로그아웃에 실패하였습니다.')
  }
}

function toggleSidebar(){
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle("hidden");
  sidebar.classList.toggle("block");
}
</script>
<header>
  <nav class="py-4">
    <div class="px-4 lg:px-8 flex justify-between items-center">
      <div class='flex items-center'>
        <!-- mobile sidebar button -->
        
        <button class="focus:outline-none group block lg:hidden mr-4" on:click={toggleSidebar}>
          <svg class="w-6 h-6 text-gray-600 group-focus:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16"></path></svg>    
        </button>
      
        <!-- header page title -->
        <div class='font-extrabold lg:font-extrabold text-2xl lg:text-3xl'>
          <slot />
        </div>
      </div>
  
      <div class="flex md:order-2">
        <ul class='flex space-x-3'>
          <li>
            <div>
              <Dropdown>
                <div class=' relative inline-block rounded-full cursor-pointer bg-white text-gray-800 shadow-sm hover:bg-blue-100 hover:text-blue-800 px-2 py-2' on:click={getUnreadNotifications}>
                  {#if $notification.unread_count }
                  <span class='bg-red-600 absolute top-2 right-3 px-1 py-1 rounded-full'></span>
                  {/if}
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
              </Dropdown>
              <DropdownMenu width="w-80">
                {#if isNotificationLoading }
                  <div class='px-4 py-2 hover:bg-gray-100 cursor-pointer'>
                    <div class="cp-text"></div>
                  </div>
                {:else} 
                  {#if $user === null }
                  <div class='px-4 py-2 hover:bg-gray-100 cursor-pointer'>
                    먼저 로그인해주세요.
                  </div>
                  {:else if $notification.unread_count === 0 }
                  <div class='px-4 py-2 hover:bg-gray-100 cursor-pointer'>
                    새로운 알림이 없습니다.
                  </div>
                  {:else if $notification.unread_list }
                    <div class='px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between'>
                      <span>알림</span>
                      <span class='text-gray-500 hover:text-gray-700 hover:underline cursor-pointer' on:click={markAllAsRead}>전체 읽음</span>
                    </div>
                    {#each $notification.unread_list as noti, index (index)}
                      <div class='px-4 py-2 hover:bg-gray-100 cursor-pointer' on:click={()=>notificationClick(noti.id, `projects/${noti.target.issue.project_id}/issues/${noti.target.issue.id}/`)}>
                        <div class='flex flex-col'>
                          <div>
                            <span class='font-medium mr-1'>{noti.actor.username}</span>{noti.description}<span class='ml-2 text-sm text-gray-500'>{dayjs(noti.timestamp).fromNow()}</span>
                          </div>
                          <div>
                            <span class='mr-2 text-gray-500'>{noti.target.issue.key}</span>{noti.target.issue.title}
                          </div>
                        </div>
                      </div>
                    {/each}
                  {/if}
                {/if}
                
              </DropdownMenu>
            </div>
            
          </li>
          <li>
            <div>
              <Dropdown>
                <div class='rounded-full cursor-pointer bg-white text-gray-800 shadow-sm hover:bg-blue-100 hover:text-blue-800 px-2 py-2'>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </Dropdown>
              <DropdownMenu>
                <div class='px-4 py-2 hover:bg-gray-100 cursor-pointer'>
                  프로필
                </div>
                <div class='px-4 py-2 hover:bg-gray-100 cursor-pointer' on:click={logout}>
                  로그아웃
                </div>
              </DropdownMenu>
            </div>
            
          </li>
        </ul>
    </div>

    </div>
  </nav>
</header>

<!-- <header class='border-b border-gray-300  bg-white'>
  <nav class='mx-auto md:max-w-4xl flex items-center justify-between max-w-8xl'>
    <div class='flex flex-row items-center pl-4 md:pl-0 py-4' > 
      <a class="font-medium md:text-xl text-xl" href="/" use:link>smallissue</a>
      <div class="ml-3 flex flex-row gap-2">
        <a class='btn-outline font-medium ' use:link href="/projects">프로젝트</a>
      </div>
    </div>
    <ul class="flex flex-row pr-4 md:pr-0 py-4">
      <li class="pl-8" on:click={(e)=>{ e.stopPropagation()}}>
        <Dropdown z={60}>
          <DropdownButton style="" on:click={getUnreadNotifications}>
            <div class='flex items-center'>
              {#if $notification.unread_count }
                <span class='rounded-full h-5 w-5 justify-center text-white bg-primary  text-sm'>{$notification.unread_count}</span>
              {/if}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              
            </div>
          </DropdownButton>
          <DropdownMenu right width='w-80'>
            {#if isNotificationLoading }
              <DropdownItem><div class="cp-text"></div></DropdownItem>
              <DropdownItem><div class="cp-text"></div></DropdownItem>
            {:else} 
              {#if $user === null }
                <DropdownItem>먼저 로그인해주세요.</DropdownItem>
              {:else if $notification.unread_count === 0 }
                <DropdownItem>새로운 알림이 없습니다.</DropdownItem>
              {:else if $notification.unread_list }
                <div class="w-full px-4 py-2 text-sm flex justify-between">
                  <span>알림</span>
                  <span class='text-gray-500 hover:text-gray-700 hover:underline cursor-pointer' on:click={markAllAsRead}>전체 읽음</span>
                </div>
                {#each $notification.unread_list as noti, index (index)}
                  <DropdownItem on:click={()=>notificationClick(noti.id, `projects/${noti.target.issue.project_id}/issues/${noti.target.issue.id}/`)}>
                    <div class='flex flex-col'>
                      <div>
                        <span class='font-medium mr-1'>{noti.actor.username}</span>{noti.description}<span class='ml-2 text-sm text-gray-500'>{dayjs(noti.timestamp).fromNow()}</span>
                      </div>
                      <div>
                        <span class='mr-2 text-gray-500'>{noti.target.issue.key}</span>{noti.target.issue.title}
                      </div>
                    </div>
                  </DropdownItem>
                {/each}
              {/if}
            {/if}
            
          </DropdownMenu>
        </Dropdown>
      </li>
      <li class="pl-8" >
        {#if $user }
          <div on:click={logout} class='cursor-pointer'>
            logout
          </div>
        {:else}
          <a href="/login" use:link>
            login
          </a>
        {/if}
      </li>
    </ul>
  
    
  </nav>
</header> -->