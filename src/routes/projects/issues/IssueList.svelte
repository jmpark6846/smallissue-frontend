<script>
import Sortable from 'sortablejs';
import { onMount } from "svelte";
import { navigate, useParams } from "svelte-navigator";
import Dropdown from "../../../components/Dropdown/Dropdown.svelte";
import DropdownButton from "../../../components/Dropdown/DropdownButton.svelte";
import DropdownItem from "../../../components/Dropdown/DropdownItem.svelte";
import DropdownMenu from "../../../components/Dropdown/DropdownMenu.svelte";
import api from "../../../utils/api";


const params = useParams();

let loading = true;
let isCreating = false;
let newIssueBlock;
let newIssueButton;
let newIssueTitleInput;
let issueListEl;
let issuesSortable;
let open = false;
$: project = {};
$: issues = [];
$: ISSUES_URL = `/projects/${$params.id}/issues/`;
$:{
  if(issueListEl){
    issuesSortable = Sortable.create(issueListEl, {
      animation: 150,
      ghostClass: 'blue-background-class',
      onEnd: async function(e){
        try {
          let new_orders = issuesSortable.toArray()
          await api.patch(ISSUES_URL+'set_orders/', {new_orders});
        } catch (error) {
          console.error(error)
        }
      }
    });
  }
}
function toggle(){
  open = !open
  if (!open){
    selectedIssue = null;
    isModalBodyEditing=false;
    window.tinymce.activeEditor.destroy();
  }
}
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
    project = res[0].data
    issues = res[1].data
    loading=false;
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
      project: $params.id
    }
    const res = await api.post(`projects/${$params.id}/issues/`, data);
    issues = [ ...issues, res.data ];
    newIssueTitleInput.value = "";
    
  } catch (error) { 
    console.error(error);
  }
}

async function handleModalStatusChange(e, index){
  let newStatus = Number(e.detail.index)
  issues[index].status = newStatus
  await updateIssue(index, { status: newStatus })
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

async function handleAssigneeChange(e, index){
  const assigneeId = e.detail.value
  await updateIssue(index, {assignee: assigneeId});
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


</script>

{#if loading }
<section class='container mx-auto flex-auto px-4 md:px-0 py-5 h-full'>
  <h1 class='text-3xl font-semibold mb-4' class:cp-text={loading} />
  <div class='border rounded-md shadow-sm bg-white mb-1'>
    <div class='py-4 px-4'>이슈</div>
    <div class='flex flex-col'>
      <div class="w-full py-3 px-4 border-t" class:cp-text-long={loading}></div>
      <div class="w-full py-3 px-4 border-t" class:cp-text-long={loading}></div>
      <div class="w-full py-3 px-4 border-t" class:cp-text-long={loading}></div>
    </div>
  </div>
</section>
{:else}
<section class='px-4 md:px-0 py-5 h-full'>
  <h1 class='text-3xl font-semibold mb-4'>{project.name}</h1>
  <div class='border rounded-md shadow-sm bg-white mb-1'>
    <div class='py-4 px-4'>이슈 {issues.length}개</div>
    
    <div bind:this={issueListEl} class='flex flex-col'>
      {#each issues as issue, issue_index (issue.id)}
        <div data-id={issue.id} class="flex flex-col md:items-center  md:flex-row gap-3 bg-white hover:bg-gray-50 hover:cursor-pointer py-3 px-4 border-t last:rounded-b-md" on:click={navigate(ISSUES_URL+issue.id)} style={`z-index: ${1000-issue_index}`}>
          <div class='text-gray-700 text-sm'>{issue.key}</div>
          <div class='flex-auto'>{issue.title}</div>
          <div class='gap-3 flex flex-row text-gray-800' on:click={(e)=>{ e.stopPropagation()}}>
            <Dropdown z={50-issue_index}>
              <DropdownButton 
                on:click={loadProjectUsers}>
                {issue.assignee ? issue.assignee.username : "없음"}
              </DropdownButton>
              <DropdownMenu right>
                <DropdownItem on:click={(e)=>handleAssigneeChange(e, issue_index)} value={null} >할당 해제</DropdownItem>
                {#each userList as user, index (index)}
                  <DropdownItem on:click={(e)=>handleAssigneeChange(e, issue_index)} value={user.id}>{user.username}</DropdownItem>
                {/each}
              </DropdownMenu>
            </Dropdown>

            <Dropdown z={50-issue_index}>
              <DropdownButton style={issueStatus[issue.status].btnClass}>
                {issueStatus[issue.status].label}
                <svg class="w-5 h-5 ml-2 -mr-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
              </DropdownButton>
              <DropdownMenu right>
                {#each issueStatus as status, index (index)}
                  <DropdownItem on:click={(e)=>handleModalStatusChange(e, issue_index)} >{status.label}</DropdownItem>
                {/each}
              </DropdownMenu>
            </Dropdown>
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

</section>
{/if}