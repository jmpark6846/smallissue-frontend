<script>
import Sortable from 'sortablejs';
import { onMount, tick } from "svelte";
import { navigate, useParams } from "svelte-navigator";

import user from '../../../store/user';
import api from "../../../utils/api";
import { project } from '../../../store';
import IssueDetail from './IssueDetail.svelte';
import Dropdown from '../../../components/Dropdown/Dropdown.svelte';
import DropdownMenu from '../../../components/Dropdown/DropdownMenu.svelte';

const params = useParams();

let loading = true;
let isCreating = false;
let newIssueBlock;
let newIssueButton;
let newIssueTitleInput;
let issueListEl;
let issuesSortable;
let open = false;
$: issues = [];
$: ISSUES_URL = `/projects/${$params.id}/issues/`;
let issue = null;
let isIssueSidebarShow = false;
// $:{
//   if(issueListEl){
//     issuesSortable = Sortable.create(issueListEl, {
//       animation: 150,
//       ghostClass: 'blue-background-class',
//       chosenClass: 'sortable-chosen',
//       onEnd: async function(e){
//         try {
//           let new_orders = issuesSortable.toArray()
//           await api.patch(ISSUES_URL+'set_orders/', {new_orders});
//         } catch (error) {
//           console.error(error)
//         }
//       }
//     });
//   }
// }

const issueStatus = [
  { label: "해야 할 일", btnClass: 'btn'}, 
  { label: "진행 중", btnClass: 'btn-blue'},
  { label: "완료됨", btnClass: 'btn-green'}
];

function getProject(){
  return api.get(`projects/${$params.id}/`);
}

function getProjectIssues(){
  return api.get(`projects/${$params.id}/issues`);
}

window.addEventListener('click', function(event) {
  if(!isCreating && newIssueButton && newIssueButton.contains(event.target)){
    isCreating = true;
  }
  else if(isCreating && !newIssueBlock.contains(event.target) ){
    isCreating=false;
  }
})

$: {
  if(newIssueTitleInput){
    newIssueTitleInput.focus();
  }
}

onMount(async () => {
  try {
    const res = await Promise.all([getProject(), getProjectIssues()]);
    project.set(res[0].data)
    issues = res[1].data
    loading=false;
    await tick();
    // await issueClick(issues[0].id)
  } catch (error) {
    console.error(error);
  }
})

async function inputHandler(event){
  if(event.keyCode === 13){ // ENTER
    await createNewIssue();
  } 
}

async function createNewIssue(){
  if (newIssueTitleInput.value === ""){
    return;
  }
  try {
    const data = {
      title: newIssueTitleInput.value,
      project: $params.id,
      author: $user.pk
    }
    const res = await api.post(`projects/${$params.id}/issues/`, data);
    issues = [ ...issues, res.data ];
    newIssueTitleInput.value = "";
    
  } catch (error) { 
    console.error(error);
  }
}

async function handleModalStatusChange(status_index, issue_index){
  issues[issue_index].status = status_index
  await updateIssue(issue_index, { status: status_index })
}


let userList = [];

async function loadProjectUsers(){
  try {
    const res = await api.get(`projects/${$params.id}/users`);
    userList = res.data.users
  } catch (error) {
    console.error(error);
  }
}


async function handleAssigneeChange(user_index, issue_index){
  const assigneeId = user_index === null ? null : userList[user_index].id;
  await updateIssue(issue_index, {assignee: assigneeId});
}

async function updateIssue(index, updated){
  let data = { ...updated }
  data['assignee'] = data.assignee === null ?  null : data.assignee

  try {
    const res = await api.patch(`/projects/${$params.id}/issues/${issues[index].id}/`, data);
    issues[index] = { ...issues[index], ...res.data }
  } catch (error) {
    console.error(error);
  }
}

function toggleIssueSidebar(){
  const issueSidebarEl = document.getElementById('issue-sidebar');
  issueSidebarEl.classList.toggle('hidden');
  issueSidebarEl.classList.toggle('block');
  isIssueSidebarShow = !isIssueSidebarShow;
  if(!isIssueSidebarShow){
    issue = null;
  }
}
async function issueClick(id, index){
  if(isIssueSidebarShow){
    if(id === issue.id){
      issue = null;
      toggleIssueSidebar(id)
      return ;
    }
  }else{
    toggleIssueSidebar(id)
  }
  try { 
    const res = await api.get(ISSUES_URL+id)
    issue = res.data;
  } catch (error) {
    console.error(error);
  }
}

function updateCurrentIssue(currentIssue){
  issues.forEach((issue, idx) => {
    if(issue.id === currentIssue.id){
      issues[idx] = currentIssue;
    }
  })
}


</script>

{#if loading }
<section class='px-4 lg:px-8'>
  <div class='rounded-lg bg-white mb-1'>
    <div class='py-4 px-4'>이슈</div>
    <div class='flex flex-col'>
      <div class="w-full py-3 px-4 border-t" class:cp-text-long={loading}></div>
      <div class="w-full py-3 px-4 border-t" class:cp-text-long={loading}></div>
      <div class="w-full py-3 px-4 border-t" class:cp-text-long={loading}></div>
    </div>
  </div>
</section>
{:else}
<section class='px-4 lg:px-8 flex space-x-4 flex-auto h-full'>
  <div id='issue-list' class='flex-auto'>
    <div class='rounded-lg bg-white mb-1'>
      <div class='py-4 px-4'>이슈 {issues.length}개</div>
      
      <div bind:this={issueListEl} class='flex flex-col'>
        {#each issues as issue, issue_index (issue.id)}
          <div data-id={issue.id} class="flex flex-col md:items-center md:flex-row hover:bg-gray-100 hover:cursor-pointer py-3 px-4 last:rounded-b-lg" on:click={()=>issueClick(issue.id, issue_index)}>
            <div class='flex-auto mb-1 lg:mb-0'><span class='text-gray-500 hidden lg:inline-block text-sm mr-4'>{issue.key}</span><span class="font-medium">{issue.title}</span></div>

            <div class='flex justify-between items-center'>
              <span class='text-gray-500 lg:hidden block text-sm mr-4'>{issue.key}</span>
              <div class='gap-3 flex flex-row text-gray-800' on:click={(e)=>{ e.stopPropagation() }}>
                <Dropdown on:click={loadProjectUsers}>
                  <div class="flex items-center rounded-lg px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 focus:bg-gray-300 cursor-pointer">
                    <span>{issue.assignee ? issue.assignee.username : "없음"}</span>
                  </div>
                </Dropdown>
                <DropdownMenu>
                  <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" on:click={()=>handleAssigneeChange(null, issue_index)}>할당 해제</div>
                  {#each userList as user, user_index (user_index)}
                    <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" on:click={()=>handleAssigneeChange(user_index, issue_index)}>{user.username}</div>
                  {/each}
                </DropdownMenu>
  
                <Dropdown>
                  <div class={`flex items-center rounded-lg  px-2 py-1 text-sm cursor-pointer ${issueStatus[issue.status].btnClass}`}>
                    <span>{issueStatus[issue.status].label}</span>
                  </div>
                </Dropdown>
                <DropdownMenu>
                  {#each issueStatus as status, status_index (status_index)}
                    <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" on:click={()=>handleModalStatusChange(status_index, issue_index)}>{status.label}</div>
                  {/each}
                </DropdownMenu>
              </div>
            </div>
            
          </div>
        {/each}
      </div>
  
      {#if isCreating }
      <div 
        class={`py-3 px-4 ${isCreating ? "ring-1 ring-blue-500" : "hidden"}`} 
        bind:this={newIssueBlock}>
        <input bind:this={newIssueTitleInput} type="text" class='w-full focus:outline-none leading-none' on:keypress={inputHandler} placeholder="무엇을 해야하나요?">
      </div>
      {/if}
  
    </div>
  
    <div 
      bind:this={newIssueButton} 
      class="rounded-md py-3 px-4 hover:bg-gray-200 cursor-pointer flex flex-row items-center text-gray-700 space-x-1"
      class:hidden={isCreating}>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
      </svg>
      <span>이슈 만들기</span>
    </div>
  </div>

  <!-- issue sidebar -->
  <div id="issue-sidebar" class='fixed top-0 right-0 lg:static w-full lg:w-128 hidden h-full overflow-y-auto'>
    <div class='rounded-lg bg-white'>
      <IssueDetail id={issue && issue.id} onClose={toggleIssueSidebar} onIssueChange={updateCurrentIssue} ></IssueDetail>
    </div>
  </div>
</section>
{/if}

<style>
#issue-list::-webkit-scrollbar {    
  display: none;
}
#issue-list{
  -ms-overflow-style: none;
  scrollbar-width: none;  
}
</style>