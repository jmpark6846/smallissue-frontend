<script>
import { link, navigate } from 'svelte-routing';
import cookie from 'cookie'
import user from '../store/user';
import api from '../utils/api';
import token from '../store/token';

async function logout(){
  const { refresh } = $token;
  const res = await api.post('accounts/logout/', { refresh });
  if(res.status === 200){
    token.set({});
    user.set({});
    navigate('/login')
  }
  else{
    console.error(res.error);
  }
}
</script>
<header>
  <nav class='w-full mx-auto bg-white flex items-center justify-between'>
    <div class='flex-none items-center pl-4 md:pl-6 lg:w-60 xl:w-72 py-4' > 
      <a class="font-medium md:text-xl text-1xl" href="/" use:link>smallissue</a>
    </div>

    
    <ul class="flex flex-row px-4 md:px-6 py-4">
      <li class="pl-8">
        <a href="/user" use:link>
          <!-- Bell -->
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </a>
      </li>
      <li class="pl-8" >
        {#if $user.email }
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
</header>