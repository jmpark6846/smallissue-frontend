<script>
import { navigate, useParams } from "svelte-navigator";
import { onMount } from "svelte";
import api from "../../utils/api";
import { project, user } from "../../store";
import Modal from "../../components/Modal/Modal.svelte";
import ModalTitle from "../../components/Modal/ModalTitle.svelte";
import ModalBody from "../../components/Modal/ModalBody.svelte";
import ModalFooter from "../../components/Modal/ModalFooter.svelte";
import dayjs from "dayjs";
import Select from 'svelte-select';
import PaginationNav from "svelte-paginate/src/PaginationNav.svelte";

const params = useParams();
let participations = { list: [], count: null, page_size: null, current_page: null };
let teams = { list: [], count: null, page_size: null, current_page: null };
let loading = true;
let modalOpen = false;
let modalEl;
let newUser = null;

let teamModalOpen = false;
let teamModalEl;
let newTeam = "";
let newTeamErrorMessage="";

let selectedTeam = {};
let addTeammateModalOpen = false;
let newTeammate = null;

function getProject(){
  return api.get(`projects/${$params.id}/`);
}

async function getParticipations(page_num){
  try {
    const res = await api.get(`projects/${$params.id}/participations/${ page_num ? `?page_num=${page_num}` : "" }`);
    participations = res.data
  } catch (error) {
    console.error(error);
  }
}
function includeParticipationFilter(users){
  return users.filter(user => {
    for(const p of participations.list){
      if(p.user.id === user.id){
        return true;
      }
    }
    return false;
  })
}

function excludeParticipationFilter(users){
  return users.filter(user => {
    for(const p of participations.list){
      if(p.user.id === user.id){
        return false;
      }
    }
    return true;
  })
}

const searchUser = async(filterText, filter, team) => {
  try {
    const res = await api.get(`accounts/search/`, { params: { email: filterText, project: $params.id, filter, team }});
    return res.data

  } catch (error) {
    console.error(error);
  } 
}

async function handleDeleteUser(participationId){
  if (confirm('사용자를 삭제하시겠습니까?')){
    try {
      const participation = participations.list.find(p => p.id === participationId)
      await api.delete(`projects/${$params.id}/participations/${participation.id}/`);
      participations.list = participations.list.filter(p => p.id !== participationId);
      await getTeams()
    } catch (error) {
      console.error(error);
    }
  }
}

async function getTeams(page_num){
  try {
    const res = await api.get(`projects/${$params.id}/teams/${ page_num ? `?page_num=${page_num}` : "" }`);
    teams = res.data
  } catch (error) {
    console.error(error);
  }
}

onMount(async () => {
  try {
    const res = await Promise.all([
      getProject(), 
    ]);
    await getParticipations(),
    await getTeams()
    project.set(res[0].data)

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

function toggleTeamModal(){
  teamModalOpen = !teamModalOpen
  if(!teamModalOpen){
    newTeam = null;
    newTeamErrorMessage = "";
  }
}

async function submit(){
  try {
    const res = await api.post(`projects/${$params.id}/participations/`, { user: newUser.id })
    participations.list = [ ...participations.list, res.data]
    toggle()
  } catch (error) {
    console.error(error);
  }
}

async function submitTeam(){
  try {
    const res = await api.post(`projects/${$params.id}/teams/`, { project: $params.id, name: newTeam })
    teams.list = [ ...teams.list, res.data]
    toggleTeamModal()
  } catch (error) {
    if(error.response.status === 400){
      newTeamErrorMessage=error.response.data.non_field_errors[0];
      return;
    }
    console.error(error);
  }
}

async function handleDeleteTeam(id){
  if (confirm('팀을 삭제하시겠습니까?')){
    try {
      const res = await api.delete(`projects/${$params.id}/teams/${id}/`);
      teams.list = teams.list.filter(team=> team.id !== id);
      toggleAddTeammateModal()

    } catch (error) {
      console.error(error);
    }
  }
}

function clickTeam(id){
  selectedTeam = teams.list.find(team => team.id === id)
  toggleAddTeammateModal()
}

function selectAddTeammate(e){
  newTeammate = e.detail
}

async function submitAddTeammate() {
  if(newTeammate.id){
    try {
      const res = await api.post(`projects/${$params.id}/teams/${selectedTeam.id}/users/`, { user: newTeammate.id })
      selectedTeam.users = res.data
      teams.list.forEach(team=>{
        if(team.id === selectedTeam.id){
          team.users = res.data
        }
      })
      teams.list =  [ ...teams.list ]
    } catch (error) {
      console.error(error);
    }
  }
}

function toggleAddTeammateModal(){
  addTeammateModalOpen = !addTeammateModalOpen
  if(!addTeammateModalOpen){
    newTeammate = null;
  }
}

async function deleteTeammate(id){
  if (confirm('팀원을 팀에서 삭제하시겠습니까?')){
    try {
      await api.delete(`projects/${$params.id}/teams/${selectedTeam.id}/users/${id}/`);
      selectedTeam.users = selectedTeam.users.filter(user => user.id !== id);
      teams.list.forEach(team=>{
        if(team.id === selectedTeam.id){
          team.users = selectedTeam.users
        }
      })
      teams.list =  [ ...teams.list ]
    } catch (error) {
      console.error(error);
    }
  }
}

async function leaveProject(){
  if(confirm("탈퇴하시겠습니까?")){
    
    if($user.pk === $project.leader.id){
      alert('프로젝트 리더는 탈퇴할 수 없습니다. 리더를 변경 후 탈퇴하거나 프로젝트를 삭제해주세요.');
      return;
    }

    try {
      const participation = participations.list.find(p => p.user.id === $user.pk)
      await api.delete(`projects/${$params.id}/participations/${participation.id}/`);      
      navigate('/projects');
    } catch (error) {
      console.error(error);
    }
  }
}
</script>

<section class='px-4 lg:px-8 w-full'>
  <div class="flex flex-row justify-end  mb-5">
    <button class="btn-outline flex items-center" on:click={toggle}>사용자 추가하기</button>
  </div>

  <Modal modal={modalEl} open={modalOpen} toggle={toggle}>
    <ModalTitle>팀원 추가하기</ModalTitle>
    <ModalBody>
      <div class="">
        <div class="">
          <div class="text-gray-500">이메일</div>
          <Select value={newUser} placeholder="추가하려는 사용자의 이메일을 입력하세요." noOptionsMessage="사용자가 존재하지 않습니다." optionIdentifider="id" {getSelectionLabel} {getOptionLabel} loadOptions={(text)=>searchUser(text, 'exclude')} on:select={handleSelect}></Select>
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
  
  <table class='bg-white rounded-lg w-full mb-16 w-full overflow-x-auto block whitespace-nowrap'>
    <thead>
      <tr>
        <th>이름</th>
        <th>이메일</th>
        <th>팀</th>
        <th>직책</th>
        <th>합류날짜</th>
        <th>기타</th>
        <th>액션</th>
      </tr>
    </thead>
    <tbody>
      {#each participations.list as p, index (index)}
      <tr class='px-4 py-2 hover:bg-gray-100'>
          <td class="font-semibold">
            {p.user.username}
          </td> 
          <td class="">
            {p.user.email}
          </td> 
          <td class=' text-center'>
            {p.team.name || ""}
          </td>
          <td class='text-center'>
            {p.job_title || ""}
          </td>
          <td class='text-center'>
            {dayjs(p.date_joined).format('YYYY.MM.DD')}
          </td>
          <td class='text-center'>
            {#if p.user.id === $project.leader.id}
              리더
            {/if}
          </td> 
          <td class='flex justify-center'>
            {#if $user.pk === $project.leader.id && $user.pk !== p.user.id}
            <div class='text-center cursor-pointer' on:click={()=>handleDeleteUser(p.id)} >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            {/if}
          </td> 
      </tr>
      {/each}
    </tbody>
  </table>
  {#if teams.count > teams.page_size}
  <div class="page-nav mt-4 mb-16 ">
    <PaginationNav
      totalItems="{participations.count}"
      pageSize="{participations.page_size}"
      currentPage="{participations.current_page}"
      limit="{2}"
      showStepOptions="{false}"
      on:setPage="{async (e) => await getParticipations(e.detail.page)}"
    />
  </div>
  {/if}
  
  <div class="flex justify-between items-center mb-4">
    <h2 class='text-xl font-semibold'>팀</h2>
    <button class="btn-outline flex items-center" on:click={toggleTeamModal}>팀 추가하기</button>
  </div>
  <Modal modal={teamModalEl} open={teamModalOpen} toggle={toggleTeamModal}>
    <ModalTitle>팀 추가하기</ModalTitle>
    <ModalBody>
      <div class="">
        <div class="">
          <div class="text-gray-500">팀 명</div>
          <input type="text" bind:value={newTeam} placeholder="새 팀명을 입력해주세요."/>
          <div>{newTeamErrorMessage}</div>
        </div>
      </div>
    </ModalBody>
    <ModalFooter>
      <button class="btn"  on:click={toggleTeamModal}>취소</button>
      <button class="btn-primary modal-close" on:click={submitTeam}>확인</button>
    </ModalFooter>
  </Modal>
  <div class="space-y-2">
    {#if teams.list.length === 0 }
    <div class='cursor-pointer px-4 py-4 rounded-lg bg-white hover:bg-gray-100'>
      <div class='text-gray-500'>
        없음
      </div>
    </div>
    {:else}
      {#each teams.list as team, index (index)}
      <div class='cursor-pointer px-4 py-4 rounded-lg bg-white hover:bg-gray-100' on:click={()=>clickTeam(team.id)}>
        <div class='flex flex-row  items-center '>
          <span class="font-semibold mr-12">
            {team.name}
          </span> 
          <span class=''>
            {team.users.length}명
          </span>
        </div>
      </div>
      {/each}
      {#if teams.count > teams.page_size}
      <div class="page-nav mt-4 mb-16 ">
        <PaginationNav
          totalItems="{teams.count}"
          pageSize="{teams.page_size}"
          currentPage="{teams.current_page}"
          limit="{2}"
          showStepOptions="{false}"
          on:setPage="{async (e) => await getTeams(e.detail.page)}"
        />
      </div>
      {/if}
    {/if}
    
    <Modal open={addTeammateModalOpen} toggle={toggleAddTeammateModal}>
      <ModalTitle>{selectedTeam.name} 팀</ModalTitle>
      <ModalBody>
        <div class="">
          <div class="mb-4">
            <div class="text-gray-500">팀원 추가하기</div>
            <Select value={newTeammate} placeholder={`${selectedTeam.name}에 추가하려는 사용자의 이메일을 입력하세요.`} noOptionsMessage="사용자가 존재하지 않습니다." optionIdentifider="id" {getSelectionLabel} {getOptionLabel} loadOptions={(text)=>searchUser(text,'include', '-'+selectedTeam.id)} on:select={selectAddTeammate}></Select>
          </div>
          {#if selectedTeam.users }
            {#each selectedTeam.users as user, index (index)}
            <div class='cursor-pointer px-4 py-2 rounded-lg bg-white hover:bg-gray-100'>
              <div class='flex flex-row justify-between items-center'>
                <span class="font-semibold mr-4">
                  {user.username}
                </span> 
                <span class='w-40'>
                  {user.email}
                </span>
                <span on:click={async ()=>await deleteTeammate(user.id)}>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </span>
              </div>
            </div>
            {/each}
          {/if}
        </div>
      </ModalBody>
      <ModalFooter>
        <div class="flex justify-between items-center">
          <button class='rounded-lg px-4 py-2 text-sm bg-red-100 hover:bg-red-200 focus:bg-red-300 text-red-700' on:click={async()=>await handleDeleteTeam(selectedTeam.id)}>팀 삭제</button> 
          <div>
            <button class="btn"  on:click={toggleAddTeammateModal}>취소</button>
            <button class="btn-primary modal-close" on:click={submitAddTeammate}>추가</button>
          </div>
        </div>
      </ModalFooter>
    </Modal>
  </div>
  <div class='mt-8'>
    <button class='btn-red' on:click={leaveProject}>탈퇴하기</button>
  </div>
  
  {/if}
</section>
<style>
th, td {
  @apply px-3 py-2 lg:px-4 lg:py-4; 
}
</style>