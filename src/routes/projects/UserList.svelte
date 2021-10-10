<script>
import { navigate, useParams } from "svelte-navigator";
import { onMount } from "svelte";
import api from "../../utils/api";
import { project } from "../../store";
import Modal from "../../components/Modal/Modal.svelte";
import ModalTitle from "../../components/Modal/ModalTitle.svelte";
import ModalBody from "../../components/Modal/ModalBody.svelte";
import ModalFooter from "../../components/Modal/ModalFooter.svelte";
import dayjs from "dayjs";
import debounce from "lodash/debounce";
import Dropdown from "../../components/Dropdown/Dropdown.svelte";
import DropdownMenu from "../../components/Dropdown/DropdownMenu.svelte";
import Select from 'svelte-select';

const params = useParams();
let users = [];
let teams = [];
let loading = true;
let modalOpen = false;
let modalEl;
let newUser = null;
let selectEl;


function getProject(){
  return api.get(`projects/${$params.id}/`);
}

function getProjectUsers(){
  return api.get(`projects/${$params.id}/users/`);
}

const searchUser = async(filterText) => {
  try {
    const res = await api.get(`accounts/search/?email=${filterText}`);
    return res.data.filter(user => {
      for(const teamUser of users){
        if(teamUser.id === user.id){
          return false;
        }
      }
      return true;
    })
  } catch (error) {
    console.error(error);
  } 
}


onMount(async () => {
  try {
    const res = await Promise.all([
      getProject(), 
      getProjectUsers(),
      api.get(`projects/${$params.id}/teams/`)
    ]);
    project.set(res[0].data)
    users = res[1].data.users
    teams = res[2].data
    loading=false;
  } catch (error) {
    console.error(error);
  }
})

function getOptionLabel(option){
  return `${option.username}(${option.email})`;
}

function getSelectionLabel(option){
  return `${option.username}(${option.email})`;
}

function handleSelect(e){
  newUser = e.detail
}

function toggle(){
  modalOpen = !modalOpen
  if(!modalOpen){
    newUser = null;
  }
}

async function submit(){
  try {
    const res = await api.post(`projects/${$params.id}/participations/`, { user: newUser.id })
    users = [ ...users, res.data]
    toggle()
  } catch (error) {
    console.error(error);
  }
}
</script>

<section class='px-4 lg:px-8'>
  <div class="flex flex-row justify-end  mb-5">
    <button class="btn-outline flex items-center" on:click={toggle}>만들기</button>
  </div>

  <Modal modal={modalEl} open={modalOpen} toggle={toggle}>
    <ModalTitle>팀원 추가하기</ModalTitle>
    <ModalBody>
      <div class="">
        <div class="">
          <div class="text-gray-500">이메일</div>
          <Select value={newUser} placeholder="추가하려는 사용자의 이메일을 입력하세요." noOptionsMessage="사용자가 존재하지 않습니다." optionIdentifider="id" {getSelectionLabel} {getOptionLabel} loadOptions={searchUser} on:select={handleSelect}></Select>
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
  
  <table class='bg-white rounded-lg w-full mb-16 '>
    <thead>
      <tr>
        <th>이름</th>
        <th>이메일</th>
        <th>팀</th>
        <th>직책</th>
        <th>합류날짜</th>
        <th>비고</th>
      </tr>
    </thead>
    <tbody>
      {#each users as teammate, index (index)}
      <tr class='px-4 py-2 hover:bg-gray-100'>
          <td class="font-semibold">
            {teammate.username}
          </td> 
          <td class="">
            {teammate.email}
          </td> 
          <td class=' text-center'>
            {teammate.team.name || ""}
          </td>
          <td class='text-center'>
            {teammate.participation.job_title || ""}
          </td>
          <td class='text-center'>
            {dayjs(teammate.participation.date_joined).format('YYYY.MM.DD')}
          </td>
          <td class='text-center'>
            {#if teammate.id === $project.leader.id}
              리더
            {/if}
          </td> 
      </tr>
      {/each}
    </tbody>
  </table>
  

  <h2 class='text-xl font-semibold mb-4'>팀</h2>
  <div class="space-y-2">
    {#if teams }
    <div class='cursor-pointer px-4 py-4 rounded-lg bg-white hover:bg-gray-100'>
      <div class='text-gray-500'>
        없음
      </div>
    </div>
    {:else}
      {#each teams as team, index (index)}
      <div class='cursor-pointer px-4 py-4 rounded-lg bg-white hover:bg-gray-100'>
        <div class='flex flex-row  items-center'>
          <span class="font-semibold w-40 max-w-40">
            {team.name}
          </span> 
          <span class='w-40'>
            사용자 목록
          </span>
          <span>
            
          </span> 
        </div>
      </div>
      {/each}
    {/if}
  </div>
  {/if}
</section>
<style>
th, td {
  @apply px-4 py-4;
}
</style>