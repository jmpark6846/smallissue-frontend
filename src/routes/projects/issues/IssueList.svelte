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
import { issueStatus } from '../../../utils/common';
import truncateString from '../../../utils/truncateString';

const params = useParams();

let loading = true;
let isCreating = false;
let newIssueBlock;
let newIssueButton;
let newIssueTitleInput;
let issueListEl;
let issuesSortable;

let issuesSource = [];
$: issues = [];
$: ISSUES_URL = `/projects/${$params.id}/issues/`;

let openedIssue = null;
let isIssueSidebarShow = false;
// $:{
//   if(issueListEl){
//     issuesSortable = Sortable.create(issueListEl, {
//       animation: 150,
//       ghostClass: 'blue-backxground-class',
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

/*
options 
[option]

option 
{
  issue attribute: value
}
*/

function statusButtonClick(option){
  const buttons = document.getElementsByClassName('status-button')
  for(let i=0;i<buttons.length;i++){
    buttons[i].classList.remove('active');
  }
  
  if(option){
    let status = Object.values(option)[0]
    
    for(let i=0;i<buttons.length;i++){
      if(buttons[i].getAttribute('data-status') === String(status)){
        buttons[i].classList.add('active');
      }
    }
  }else{
    const button = document.getElementById('status-all-button');
    button.classList.add('active');
    issues=[...issuesSource]
  }
  let options = [];
  if(option){
    options = [option]
  }
  filterIssues(options)
}
function filterIssues(options){ 
  let filtered = [...issuesSource];
  for(const opt of options){
    let key = Object.keys(opt)[0]
    filtered = filtered.filter(issue=>issue[key]===opt[key])
  }
  issues = [ ...filtered ]
}

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
    issuesSource = res[1].data
    issues = [...issuesSource]
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
    issuesSource = [ ...issuesSource, res.data ]
    issues = [ ...issues, res.data ];
    newIssueTitleInput.value = "";
    
  } catch (error) { 
    console.error(error);
  }
}

async function handleStatusChange(status_index, issue_index){
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
    updateIssuesSource(res.data)
    updateIssueDisplay(res.data)
  } catch (error) {
    console.error(error);
  }
}

function updateIssuesSource(updatedIssue){
  for(let i=0;i<issuesSource.length;i++){
    if(issuesSource[i].id === updatedIssue.id){
      issuesSource[i] = { ...issuesSource[i], ...updatedIssue}
      break;
    }
  }
}

function updateIssueDisplay(updatedIssue){
  for(let i=0;i<issuesSource.length;i++){
    if(issues[i].id === updatedIssue.id){
      issues[i] = { ...issues[i], ...updatedIssue}
      break;
    }
  }
  openedIssue = updatedIssue
}
function toggleIssueSidebar(){
  const issueSidebarEl = document.getElementById('issue-sidebar');
  issueSidebarEl.classList.toggle('hidden');
  issueSidebarEl.classList.toggle('block');
  isIssueSidebarShow = !isIssueSidebarShow;
  if(!isIssueSidebarShow){
    openedIssue = null;
  }
}
async function issueClick(id, index){
  if(isIssueSidebarShow){
    if(id === openedIssue.id){
      toggleIssueSidebar()
      return ;
    }
  }else{
    toggleIssueSidebar()
  }
  try { 
    const res = await api.get(ISSUES_URL+id)
    openedIssue = res.data;
  } catch (error) {
    console.error(error);
  }
}

function updateOpenedIssue(currentIssue){
  updateIssuesSource(currentIssue)
  updateIssueDisplay(currentIssue)
}

function handleDelete(id){
  issuesSource = [ ...issuesSource.filter(issue=>issue.id !== id)];
  issues = [ ...issues.filter(issue=>issue.id !== id)];
  toggleIssueSidebar();
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
<section class='px-4 lg:px-8  flex-auto h-full'>
  <div class='space-x-2 mb-2'>
    <button id='status-all-button' class='status-button btn active' on:click={()=>statusButtonClick()}>전체</button>
    {#each issueStatus as status (status.value)}
      <button data-status={status.value} class='status-button btn' on:click={()=>statusButtonClick({ status: status.value })}>{status.label}</button>
    {/each}
  </div>
  <div class="flex space-x-4">
    <div id='issue-list' class='flex-auto'>
      <div class='rounded-lg bg-white mb-1'>
        <div class='py-4 px-4'>이슈 {issues.length}개</div>
        
        <div bind:this={issueListEl} class='flex flex-col'>
          {#each issues as issue, issue_index (issue.id)}
            <div data-id={issue.id} class="flex flex-col lg:items-center lg:flex-row hover:bg-gray-100 hover:cursor-pointer py-3 px-4 last:rounded-b-lg" on:click={()=>issueClick(issue.id, issue_index)}>
              <span class='text-gray-500 hidden lg:inline-block text-sm mr-4'>{issue.key}</span>
              <span class="font-medium flex-auto">{isIssueSidebarShow ? truncateString(issue.title, 60) : issue.title}</span>
              <div class='flex justify-between lg:justify-end items-center'>
                <span class='text-gray-500 lg:hidden block text-sm mr-4'>{issue.key}</span>
                <div class='gap-3 flex flex-row text-gray-800' on:click={(e)=>{ e.stopPropagation() }}>
                  <Dropdown on:click={loadProjectUsers}>
                    <div class="flex items-center whitespace-nowrap rounded-lg px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 focus:bg-gray-300 text-gray-500 hover:text-gray-700 cursor-pointer">
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
                    <div class={`flex items-center rounded-lg whitespace-nowrap px-2 py-1 text-sm cursor-pointer ${issueStatus[issue.status].btnClass} label`}>
                      <span>{issueStatus[issue.status].label}</span>
                    </div>
                  </Dropdown>
                  <DropdownMenu>
                    {#each issueStatus as status, status_index (status_index)}
                      <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" on:click={()=>handleStatusChange(status_index, issue_index)}>{status.label}</div>
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
    <div id="issue-sidebar" class='fixed top-0 right-0 lg:static w-full lg:w-128 lg:min-w-128 hidden h-full overflow-y-auto'>
      <div class='rounded-lg bg-white'>
        <IssueDetail id={openedIssue && openedIssue.id} status={openedIssue && openedIssue.status} assignee={openedIssue && openedIssue.assignee} onDelete={handleDelete} onClose={toggleIssueSidebar} onIssueChange={updateOpenedIssue} ></IssueDetail>
      </div>
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