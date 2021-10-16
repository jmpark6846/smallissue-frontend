<script>
import { link } from 'svelte-navigator';
import Header from "../components/Header.svelte";
import { project, user, appNoti } from '../store';
import {getNotificationsContext} from 'svelte-notifications';
import { useLocation } from 'svelte-navigator';
const location = useLocation();
const { addNotification } = getNotificationsContext();
let route = null;
$: {
  const {pathname} = $location;
  const _pathArray = pathname.split('/')
  route = _pathArray[_pathArray.length - 1];
}

$:{
  if($appNoti.length > 0 ){
    for(const noti of $appNoti){
      addNotification({
        text: noti.text,
        type: noti.type,
        position: 'bottom-center',
        removeAfter: 4000
      })
    }
    appNoti.set([]);
  }
}

const tippyOptions = {
  placement: "right",
  arrow: false,
}

function toggleSidebar(){
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle("hidden");
  sidebar.classList.toggle("block");
}

function handleRouteChange(pathname){
  
}
</script>
  

<div class='h-full w-full'>
  <div class="lg:flex h-full w-full">
  
    <aside id='sidebar' class='flex-none w-full lg:pt-4 space-y-6 lg:w-60 shadow-sm h-full bg-gray-50 text-sm absolute lg:static top-0 left-0 z-10 hidden lg:block  '>
      <div class='px-2 lg:px-4'>
        <div class="py-4">
          <div class="flex items-center px-2" style="height: 46px;">
            <button class="focus:outline-none group lg:hidden mr-4" on:click={toggleSidebar}>
              <svg class="w-6 h-6 text-gray-600 group-focus:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16"></path></svg>    
            </button>
            <span>
              <a class="font-bold text-2xl lg:text-2xl" href="/" use:link>smallissue</a>
            </span>  
          </div>
        </div>
        <ul class='space-y-1'>
          <li >
            <a href="/projects/" use:link>
              <div class='sidebar-item py-3 px-2 lg:px-4 flex items-center hover:bg-gray-100 rounded-lg cursor-pointer' class:active={route==='projects'} >
                <span class='mr-4'>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                </span>
              
                <span class='font-semibold'>
                  프로젝트
                </span>
              </div>
            </a>
          </li>
        </ul>
      </div>
      {#if $project }
      <div class='px-2 lg:px-4'>
        <div class='py-4 px-2 lg:px-4'>
          <div class='font-semibold'>
            {$project.name}
          </div>
        </div>
        <ul class='space-y-1'>
          <li > 
            <a href={"/projects/"+$project.id+'/issues/'} use:link>
            <div class='sidebar-item py-3 px-2 lg:px-4 flex items-center hover:bg-gray-100 rounded-lg cursor-pointer' class:active={route==='issues'}>
              <span class='mr-4'>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </span>
                <span class='font-semibold'>
                  이슈 보기
                </span>
              </div>
            </a>
          </li>
          <li>
            <a href={`/projects/${$project.id}/users/`} use:link>
              <div data-route="users" class='sidebar-item py-3 px-2 lg:px-4 flex items-center hover:bg-gray-100 rounded-lg cursor-pointer' class:active={route==='users'}>
                <span class='mr-4'>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </span>
                
                <span class='font-semibold'>
                  사용자
                </span>
              </div>
            </a>
          </li>

          {#if $user.pk === $project.leader.id }
          <li>
            <a href={`/projects/${$project.id}/settings/`} use:link>
              <div data-route="settings" class='sidebar-item py-3 px-2 lg:px-4 flex items-center hover:bg-gray-100 rounded-lg cursor-pointer' class:active={route==='settings'}>
                <span class='mr-4'>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                
                <span class='font-semibold'>
                  프로젝트 설정
                </span>
              </div>
            </a>
          </li>
          {/if}
        </ul>
      </div>
    {/if}
    
    </aside>

    <main id='content-wrapper' class='flex-auto flex flex-col pb-4 lg:py-4 h-full overflow-y-auto'>
      <Header>
        <slot name='header'>타이틀 없음</slot>
      </Header>
      <slot name='body'></slot>
    </main>

  </div>
  
</div>

<style>
  
</style>