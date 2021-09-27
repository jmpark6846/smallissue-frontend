
<script>
import debounce from 'lodash/debounce'
import Modal from '$components/Modal/index.svelte';
import { onMount } from 'svelte';
import ModalBody from '../../components/Modal/ModalBody.svelte';
import ModalFooter from '../../components/Modal/ModalFooter.svelte';
import ModalTitle from '../../components/Modal/ModalTitle.svelte';
import user from '../../store/user';
import api from '../../utils/api';

let modal;
let open = false;

let nameInput;
let keyInput;
let keyErrMsg="";
let name = "";
let key = "";
$: projects = [];

function toggle(e){
  open = !open
}

onMount(async ()=>{
  try {
    const res = await api.get('/projects/');
    console.log(res.data);
    projects = res.data;
  } catch (error) {
    console.log(error);
  }
})

const handleInput = debounce(async (e) => {
  if(e.target == keyInput){
    if(name.length > 100){
      nameInput.classList.add('error')
      
    }else{
      nameInput.classList.remove('error')
    }

    if(e.target === keyInput && e.target.value.length >= 6){
      keyErrMsg='키값은 최대 5자입니다.'
      keyInput.classList.add('error')
    }else{
      try {
        const res = await api.get('/projects/check_project_key_available/', { params: { key: e.target.value.toUpperCase() }})
        if(res.data.available){
          keyInput.classList.remove('error');
          keyErrMsg='';
        }else{
          keyInput.classList.add('error')
          keyErrMsg='프로젝트에서 이미 사용하고 있는 키값입니다.';

        }
      } catch (error) {
        console.log(error)
      }
    }
  }
}, 300)


async function submit(){

  
  const data = { name, key, leader: $user.pk, users: [$user.pk] }
  try{
    const res = await api.post('/projects/', data);
    projects = [ ...projects, res.data]
    open = false;
    key = "";
    name = "";
  }catch(e){
    console.log(e.response.data)
  }
}
</script>

<svelte:head>
  <title>프로젝트</title>
</svelte:head>

<section class='px-4 md:px-6 py-5'>
  <div class="flex flex-row justify-between  mb-5">
    <h1 class='text-2xl font-semibold'>프로젝트</h1>
    <button class="btn-primary flex items-center" on:click={toggle}>만들기</button>
  </div>

  <Modal modal={modal} open={open} toggle={toggle}>
    <ModalTitle>프로젝트 만들기</ModalTitle>
    <ModalBody>
      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <label for="project-name" class="text-gray-500">이름</label>
          <input bind:this={nameInput} name='project-name' class="input" type="text" aria-label="project-name" bind:value={name} />
        </div>
        <div class="flex flex-col gap-0.5">
          <label for="project-key" class="text-gray-500">키</label>
          <span class="text-gray-500 text-sm">영문 최대 5글자</span>
          <input on:input={handleInput} bind:this={keyInput} name='project-key' class="input" type="text" aria-label="project-key" bind:value={key}/>
          {#if keyErrMsg.length > 0}
            <span class="text-red-500 text-sm">{keyErrMsg}</span>
          {/if}
        </div>
      </div>

    </ModalBody>
    <ModalFooter>
      <button class="btn"  on:click={toggle}>취소</button>
      <button class="btn-primary modal-close" on:click={submit}>확인</button>
    </ModalFooter>
  </Modal>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
    {#each projects as project (project.id)}
    <div class='card hover:shadow-md cursor-pointer'>
      <div class='flex flex-row justify-between items-center mb-2'>
        <span class="font-medium">
          {project.name}
        </span> 
        <span class=' text-gray-800 text-sm'>
          {project.key}
        </span>
      </div>
      <!-- <div class='flex flex-none -space-x-2'>
        {#each project.users as user}
          <span class='rounded-full text-center bg-blue-600 border border-white text-white w-7 h-7'>{user.slice(0,2)}</span>
        {/each}
      </div> -->
    </div>
    {/each}
    
  </div>
</section>
