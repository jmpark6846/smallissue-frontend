<script>
import { onMount } from "svelte";
import {getNotificationsContext} from 'svelte-notifications';
const { addNotification } = getNotificationsContext();

import api from "../utils/api";
import userStore from '../store/user'
let fileBasePath = FILE_BASE_PATH
let loading=true;
let user;
let profile;
let imageUploadEl;
let avatar;

onMount(async()=>{
  try {
    loading = true;
    const res = await Promise.all([
      api.get('accounts/user'),
      api.get('accounts/profile'),
    ]) 
    user = res[0].data
    profile = res[1].data
    loading=false;
  } catch (error) {
    console.error(error);
  }
})

async function updateProfile(){
  console.log(imageUploadEl.files)
  if(imageUploadEl.files.length !== 0){
    let filename = imageUploadEl.files[0].name
    let arr = filename.split('.')
    let ext = arr[arr.length - 1]
    const headers = { 
    'Content-Type': 'image',
    // 'Content-Type':'application/octet-stream',
    'Content-Disposition': 'attachment; filename=profile_pic'+'.'+ext
  }
  
    try {
      await api.post('accounts/profile/', imageUploadEl.files[0], { headers })
    } catch (error) {
      console.error(error);
    }
  }

  try {
    const res = await api.put('accounts/user/', user)
    userStore.set(res.data);
  } catch (error) {
    console.error(error);
  }

  addNotification({
    text: '저장 완료되었습니다.',
    position: 'bottom-center',
    type: 'success',
    removeAfter: 4000
  })
}


const onFileSelected =(e)=>{
  let image = e.target.files[0];
  let reader = new FileReader();
  reader.readAsDataURL(image);
  reader.onload = e => {
        avatar = e.target.result
  };
}
	
</script>

{#if loading }
<section class='px-4 lg:px-8'>

</section>
{:else}
<section class='px-4 lg:px-8'>
  <div class='space-y-8'>
    <div>
      <div class='mb-2 font-semibold'>프로필 사진</div>
      <div class='mb-2'>
        {#if avatar}
        <img class='object-cover w-48 h-48 rounded-full' src="{avatar}" alt="d" />
        {:else if profile.file}
          <img src={fileBasePath+profile.file} alt="profile picture" class='object-cover w-48 h-48 rounded-full' />
        {:else}
          <img class='object-cover w-48 h-48 rounded-full' src="https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-alt-512.png" alt="" /> 
        {/if}
      </div>
      <button class='btn' on:click={()=>imageUploadEl.click()}>선택</button>
      <input class='hidden' type="file" accept="image/*" bind:this={imageUploadEl} on:change={(e)=>onFileSelected(e)}>
    </div>
    <div>
      <div class='mb-2 font-semibold'>이름</div>
      <input type="text" bind:value={user.username}>
    </div>
    <div>
      <div class='mb-2 font-semibold'>이메일</div>
      <input type="text" class='disabled:opacity-50 disabled:bg-gray-200 hover:cursor-not-allowed' bind:value={user.email} disabled>
    </div>
    <div>
      <button class='btn-blue' on:click={updateProfile}>저장</button>
      <div class='px-4 py-4 rounded-lg '></div>
    </div>
  </div>
</section>
{/if}