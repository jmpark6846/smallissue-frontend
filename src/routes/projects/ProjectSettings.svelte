<script>
import { navigate, useParams } from "svelte-navigator";
import { onMount } from "svelte";
import api from "../../utils/api";
import { project, user } from "../../store";
import Dropdown from "../../components/Dropdown/Dropdown.svelte";
import DropdownMenu from "../../components/Dropdown/DropdownMenu.svelte";
import {getNotificationsContext} from 'svelte-notifications';
const { addNotification } = getNotificationsContext();

const params = useParams();

let loading = true;
let userList = [];
let projectData = {};
function getProject(){
  return api.get(`projects/${$params.id}/`);
}

async function loadProjectUsers(){
  try {
    const res = await api.get(`projects/${$params.id}/users`);
    userList = res.data.users
  } catch (error) {
    console.error(error);
  }
}

onMount(async () => {
  loading = true;
  try {
    const res = await Promise.all([getProject()]);
    project.set(res[0].data);
    projectData = res[0].data;

    if($user.pk !== $project.leader.id){
      navigate(`/projects/${$params.id}/`, {replace: true});
    }

    loading=false;
  } catch (error) {
    console.error(error);
  }
})

async function updateProject(){
  try {
    const res = await api.put(`projects/${$params.id}/`, projectData);
    project.set(res.data)
    addNotification({
      text: '저장 완료되었습니다.',
      position: 'bottom-center',
      type: 'success',
      removeAfter: 4000
    })
  } catch (error) {
    addNotification({
      text: '저장에 실패했습니다.',
      position: 'bottom-center',
      type: 'danger',
      removeAfter: 4000
    })
    console.log(error);
  }
}

function cancelUpdate(){
  console.log($project)
  projectData = $project
} 

async function deleteProject() {
  if(confirm('프로젝트를 삭제하시겠습니까?')){
    try {
      await api.delete(`projects/${$params.id}/`)
      project.set(null)
      navigate('/projects');
    } catch (error) {
      console.error(error);
    }
  }
  
}
</script>
{#if loading }
<section class='container mx-auto flex-auto px-4 md:px-0 py-5 h-full'>

</section>
{:else}
<section class='px-4 lg:px-8'>
  <div class='space-y-8'>
    <div>
      <div class='mb-2 font-semibold'>이름</div>
      <input type="text" bind:value={projectData.name}>
    </div>

    <div>
      <div class='mb-2 font-semibold'>키</div>
      <input type="text" class="disabled:opacity-50 disabled:bg-gray-200 hover:cursor-not-allowed" disabled bind:value={projectData.key}>
    </div>

    <div>
      <div class='mb-2 font-semibold'>리더</div>
      <Dropdown on:click={loadProjectUsers} tippyOptions={{ placement: "bottom-start"}}>
        <div class="flex items-center rounded-lg px-4 py-2 bg-gray-100 hover:bg-gray-200 focus:bg-gray-300 cursor-pointer">
          <span>{projectData.leader.username}</span>
          <span>
            <svg class="w-5 h-5 ml-2 -mr-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
          </span>
        </div>
      </Dropdown>
      <DropdownMenu>
        {#each userList as user, index (index)}
          <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" on:click={()=>{projectData.leader = user}}>{user.username}</div>
        {/each}
      </DropdownMenu>
    </div>
    <div class='flex space-x-4'>
      <button class='btn-blue' on:click={updateProject}>저장</button>
      <button class='btn' on:click={cancelUpdate}>취소</button>
      <button class='btn-red' on:click={deleteProject}>삭제</button>
    </div>
  </div>
</section>
{/if}