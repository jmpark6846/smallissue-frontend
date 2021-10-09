<script>
import { navigate, useParams } from "svelte-navigator";
import { onMount } from "svelte";
import api from "../../utils/api";
import { project } from "../../store";
import Modal from "../../components/Modal/Modal.svelte";
import ModalTitle from "../../components/Modal/ModalTitle.svelte";
import ModalBody from "../../components/Modal/ModalBody.svelte";
import ModalFooter from "../../components/Modal/ModalFooter.svelte";

const params = useParams();
let users = [];
let roles = [];
let loading = true;
let userInputEl;
let username = "";
let modalOpen = false;
let modalEl;

function getProject(){
  return api.get(`projects/${$params.id}/`);
}

function getProjectUsers(){
  return api.get(`projects/${$params.id}/users/`);
}


onMount(async () => {
  try {
    const res = await Promise.all([
      getProject(), 
      getProjectUsers(),
      api.get(`projects/${$params.id}/roles/`)
    ]);
    project.set(res[0].data)
    users = res[1].data.users
    roles = res[2].data
    loading=false;
  } catch (error) {
    console.error(error);
  }
})

function toggle(e){
  modalOpen = !modalOpen
}

function submit(){
  console.log('submit')
}
</script>

<section class='px-4 lg:px-8'>
  <div class="flex flex-row justify-end  mb-5">
    <button class="btn-outline flex items-center" on:click={toggle}>만들기</button>
  </div>

  <Modal modal={modalEl} open={modalOpen} toggle={toggle} wide>
    <ModalTitle>팀원 추가하기</ModalTitle>
    <ModalBody>
      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <label for="project-name" class="text-gray-500">이름</label>
          <input bind:this={userInputEl} name='username' class="input" type="text" aria-label="username" bind:value={username} />
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
  <div class="space-y-2">
    {#each users as teammate, index (index)}
    <div class='cursor-pointer px-4 py-4 rounded-lg bg-white hover:bg-gray-100'>
      <div class='flex flex-row  items-center'>
        <span class="font-semibold w-40 max-w-40">
          {teammate.username}
        </span> 
        <span class="w-80 max-w-80">
          {teammate.email}
        </span> 
        <span class='w-40'>
          {#if teammate.role}
            {teammate.role.name}
          {/if}
        </span>
        <span>
          {#if teammate.id === $project.leader.id}
            <span class="label-gray">리더</span>
          {/if}
        </span> 
      </div>
    </div>
    {/each}
  </div>

  <h2>직책</h2>
  <div class="space-y-2">
    {#each roles as role, index (index)}
    <div class='cursor-pointer px-4 py-4 rounded-lg bg-white hover:bg-gray-100'>
      <div class='flex flex-row  items-center'>
        <span class="font-semibold w-40 max-w-40">
          {role.name}
        </span> 
        
        <span class='w-40'>
          
        </span>
        <span>
          
        </span> 
      </div>
    </div>
    {/each}
  </div>
  {/if}
</section>
