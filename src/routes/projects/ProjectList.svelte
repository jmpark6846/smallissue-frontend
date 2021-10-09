<script>
import Sortable from 'sortablejs';

import debounce from 'lodash/debounce'
import { useNavigate } from 'svelte-navigator';
import Modal from '../../components/Modal/Modal.svelte';
import ModalTitle from '../../components/Modal/ModalTitle.svelte';
import ModalBody from '../../components/Modal/ModalBody.svelte';
import ModalFooter from '../../components/Modal/ModalFooter.svelte';
import { onMount } from 'svelte';
import user from '../../store/user';
import api from '../../utils/api';
import { project } from '../../store';

const navigate = useNavigate()
let modal;
let open = false;
let loading = true;

let nameInput;
let keyInput;
let keyErrMsg="";
let name = "";
let key = "";
$: projects = [];

let projectListEl;
let projectSortable;

// $:{
//   if(projectListEl){
//     projectSortable = Sortable.create(projectListEl, {
//       animation: 150,
//       ghostClass: 'blue-background-class',
//       onEnd: async function(e){
//         try {
//           let new_orders = projectSortable.toArray()
//           await api.patch(`/projects/set_orders/`, {new_orders});
//         } catch (error) {
//           console.error(error)
//         }
//       }
//     });
//   }
// }

function toggle(e){
  open = !open
}


function handlClickProject(id, index){
  project.set({ ...projects[index] })
  console.log(projects[index])
  navigate(`/projects/${id}/issues`, { replace: true });
}

onMount(async ()=>{
  try {
    const res = await api.get('/projects/');
    projects = res.data;
    loading = false;
  } catch (error) {
    console.log(error);
  }
})

const handleInput = debounce(async (e) => {
  if(e.target == keyInput){
    e.target.value = e.target.value.toUpperCase()
    key = e.target.value

    if(name.length > 100){
      nameInput.classList.add('error')
      
    }else{
      nameInput.classList.remove('error')
    }

    if(e.target === keyInput && e.target.value.length >= 6){
      keyErrMsg='키값은 최대 5자입니다.'
      keyInput.classList.add('error')
    }else if (e.target.value.length >= 1){
      try {
        const res = await api.get('/projects/check_project_key_available/', { params: { key: e.target.value.toUpperCase() }})
        if(res.data.available){
          keyInput.classList.remove('error');
          keyErrMsg='';
        }else{
          keyInput.classList.add('error')
          keyErrMsg=res.data.error_msg;

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
    console.error(e)
  }
}
</script>

<svelte:head>
  <title>프로젝트</title>
</svelte:head>

<section class='px-4 lg:px-8'>
  <div class="flex flex-row justify-end  mb-5">
    
    <button class="btn-outline flex items-center" on:click={toggle}>만들기</button>
  </div>

  <Modal modal={modal} open={open} toggle={toggle} wide>
    <ModalTitle>프로젝트 만들기</ModalTitle>
    <ModalBody>
      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <label for="project-name" class="text-gray-500">이름</label>
          <input bind:this={nameInput} name='project-name' class="input" type="text" aria-label="project-name" bind:value={name} />
        </div>
        <div class="flex flex-col gap-0.5">
          <label for="project-key" class="text-gray-500">키</label>
          <span class="text-gray-500 text-sm">영문 대문자, 숫자, 특수문자 최대 5글자</span>
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
  {#if loading}
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
    <div class='card hover:shadow-md cursor-pointer' class:cp-paragraph={loading}></div>
    <div class='card hover:shadow-md cursor-pointer' class:cp-paragraph={loading}></div>
    <div class='card hover:shadow-md cursor-pointer' class:cp-paragraph={loading}></div>
  </div>
  {:else}
  <div bind:this={projectListEl} class="space-y-2">
    {#each projects as project, index (project.id)}
    <div data-id={project.id} class='cursor-pointer px-4 py-4 rounded-lg bg-white hover:bg-gray-100 ' on:click={()=>handlClickProject(project.id, index)}>
      <div class='flex flex-row  items-center'>
        <span class=' w-20 mr-2'>
          {project.key}
        </span>
        <span class=" font-semibold">
          {project.name}
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
  {/if}
</section>
