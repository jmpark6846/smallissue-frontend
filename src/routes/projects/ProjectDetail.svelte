<script>
import debounce from 'lodash/debounce'

import { onMount } from 'svelte';
import Modal from '../../components/Modal/Modal.svelte';
import ModalTitle from '../../components/Modal/ModalTitle.svelte';
import ModalBody from '../../components/Modal/ModalBody.svelte';
import ModalFooter from '../../components/Modal/ModalFooter.svelte';
import TextareaEditable from '../../components/TextareaEditable.svelte';

import { useParams } from 'svelte-navigator';
import Nav from "../../components/Nav/Nav.svelte";
import NavItem from "../../components/Nav/NavItem.svelte";
import api from '../../utils/api';
import TabPanel from '../../components/Nav/TabPanel.svelte';
import TabPanels from '../../components/Nav/TabPanels.svelte';
import Dropdown from '../../components/Dropdown/Dropdown.svelte';
import DropdownButton from '../../components/Dropdown/DropdownButton.svelte';
import DropdownMenu from '../../components/Dropdown/DropdownMenu.svelte';
import DropdownItem from '../../components/Dropdown/DropdownItem.svelte';
import DOMPurify from "dompurify";

const params = useParams();
let loading = true;
let issue_loading = false;
$: project = {};
$: issues = [];
$: ISSUE_URL = `projects/${$params.id}/issues/`;

let modal;
let selectedIssue = null;
let editorEl;
let open = false;

function toggle(){
  open = !open
  if (!open){
    selectedIssue = null;
    isModalBodyEditing=false;
    window.tinymce.activeEditor.destroy();
  }
}

let isCreating = false;
let newIssueBlock;
let newIssueButton;
let newIssueTitleInput;
const issueStatus = [
  { label: "해야 할 일", btnClass: 'btn'}, 
  { label: "진행 중", btnClass: 'btn-blue'},
  { label: "완료됨", btnClass: 'btn-green'}
];
let userList = [];

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


async function issueClick(id, index){
  issue_loading = true;
  selectedIssue = { index }
  toggle();
  
  try {
    const res = await api.get(ISSUE_URL + id + '/');
    selectedIssue = { ...res.data, index }
    issue_loading = false;   
  } catch (error) {
    console.error(error);  
  }
}

async function updateIssue(id, index, updated){
  let data = { ...issues[index] }
  data['assignee'] = data.assignee ? data.assignee.id : null
  data = {...data, ...updated}

  try {
    const res = await api.put(ISSUE_URL + id +'/', data);
    issues[index] = res.data 
  } catch (error) {
    console.error(error);
  }
}

async function deleteIssue(id, index){
  if(confirm('이슈를 삭제하시겠습니까?')){
    try {
      const res = await api.delete(ISSUE_URL + id + '/');
      const deleted = issues.filter((_, idx) => idx !== index)
      issues = deleted
      toggle()
    } catch (error) {
      console.error(error);
    }
  }
}

function handleModalTitleChange(e){
  if (e.detail.value === ""){
    return;
  }
  selectedIssue.title = e.detail.value;
}

async function handleModalTitleBlur(e){
  if (e.detail.value === ""){
    return;
  }
  await updateIssue(selectedIssue.id, selectedIssue.index, {title: e.detail.value})
}

async function handleModalStatusChange(e){
  let newStatus = Number(e.detail.index)
  selectedIssue.status = newStatus
  await updateIssue(selectedIssue.id, selectedIssue.index, { status: newStatus })
}

async function loadProjectUsers(){
  try {
    const res = await api.get(`projects/${$params.project_id}/users`);
    userList = res.data.users
  } catch (error) {
    console.error(error);
  }
}
async function handleAssigneeChange(index){
  const assigneeId = index === null ? null : userList[index].id;
  await updateIssue(selectedIssue.id, selectedIssue.index, {assignee: assigneeId});

  if(assigneeId){
    selectedIssue.assignee = userList[index]
  }else{
    selectedIssue.assignee = null;
  }
}
const modalBodyPlaceholder = "설명을 입력해주세요.";
function tinymceloaded() {
  window.tinymce.init({
    selector: 'div#editor',
    menubar: false,
    resize:true,
    placeholder: modalBodyPlaceholder,
    auto_focus: 'editor',
    statusbar: false,
    setup: function(editor) {
      editor.on('init', function(e) {
        isModalBodyEditing = true;
        editor.setContent(selectedIssue.body);
      });
    }
  })
}
let isModalBodyEditing = false;
function handleModalBodyClick(){
  tinymceloaded()
}

async function modalBodySave(){
  const editor = window.tinymce.activeEditor;
  const content = editor.getContent()
  selectedIssue.body = content;
  isModalBodyEditing = false;
  await updateIssue(selectedIssue.id, selectedIssue.index, {body: selectedIssue.body})
  editor.destroy()
}

function modalBodyCancel(){
  const editor = window.tinymce.activeEditor;
  editor.setContent(selectedIssue.body);
  isModalBodyEditing = false;
  editor.destroy()
}
</script>
<svelte:head>
  <title>프로젝트</title>
</svelte:head>

{#if loading }
<section class='container flex-auto px-4 md:px-0 mx-auto py-5 h-full'>
  <h1 class='text-2xl font-semibold mb-2' class:cp-text={loading} />
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
<section class='container flex-auto px-4 md:px-0 mx-auto py-5 h-full'>
  <h1 class='text-2xl font-semibold mb-2'>{project.name}</h1>
  <div class='border rounded-md shadow-sm bg-white mb-1'>
    <div class='py-4 px-4'>이슈 {issues.length}개</div>
    
    <div class='flex flex-col'>
      {#each issues as issue, index (issue.id)}
        <div class="w-full flex items-center gap-3  hover:bg-gray-50 hover:cursor-pointer py-3 px-4 border-t" on:click={async () => await issueClick(issue.id, index)}>
          <div class='text-gray-700 text-sm'>{issue.key}</div>
          <div class='flex-auto'>{issue.title}</div>
          <div class='gap-4 flex flex-row text-gray-800'>
            {#if issue.assignee }
              <div class='text-sm'>{issue.assignee.username}</div>
            {/if}
            <div 
              class:label-gray={issue.status === 0} 
              class:label-blue={issue.status === 1}
              class:label-green={issue.status === 2}>
              {issueStatus[issue.status].label}
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
  {#if open }
  <Modal modal={modal} open={open} toggle={toggle} wide>
    <ModalTitle>
      <div class='flex flex-row justify-between items-center'>
        <span class="text-gray-500 text-sm font-normal">{issues[selectedIssue.index].key}</span>
        <Nav>
          <li>
            <Dropdown z={50}>
              <DropdownButton style="btn-outline">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </DropdownButton>
              <DropdownMenu width="w-32" right>
                <DropdownItem on:click={async () => await deleteIssue(selectedIssue.id, selectedIssue.index)}>삭제</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            
          </li>
          <NavItem on:click={toggle} style="outline">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
          </NavItem>
        </Nav>
      </div>
    </ModalTitle>
    <ModalBody>
      {#if issue_loading }
      <div class="flex flex-row gap-6 w-full ">
        <div class='main-section flex flex-col flex-auto gap-4 w-full md:flex-auto'>
          <div class='title-section flex flex-col text-2xl font-medium -ml-2'>
            <TextareaEditable content={issues[selectedIssue.index].title} on:change={handleModalTitleChange} on:blur={handleModalTitleBlur}/>
          </div>
          <div class='body-section flex flex-col'>
            <span for="issue-body" class="font-medium text-sm text-gray-800">설명</span>
            <div class='-ml-2' class:cp-paragraph={issue_loading}></div>
          </div>
        </div>
        
        <div class="info-section flex flex-col gap-4 w-full md:w-72">
          <div class='flex flex-col' class:cp-paragraph={issue_loading}>    
          </div>
          <div class='flex flex-col' class:cp-paragraph={issue_loading}>    
          </div>
        </div>

      </div>
      {:else}
      <div class="flex flex-row flex-wrap gap-6">
        <div class='main-section flex flex-col w-full flex-auto gap-4 w-auto'>
          <div class='title-section flex flex-col text-2xl font-medium -ml-2'>
            <TextareaEditable content={selectedIssue.title} on:change={handleModalTitleChange} on:blur={handleModalTitleBlur}/>
          </div>
          <div class='body-section flex flex-col'>
            <span for="issue-body" class="font-medium text-sm text-gray-800 mb-2">설명</span>
            <div id="editor" bind:this={editorEl} class='p-2 hover:bg-gray-100 cursor-pointer rounded-md overflow -ml-2' on:click={handleModalBodyClick}>
              {@html selectedIssue.body === "" ? `<div class='text-gray-500'>${modalBodyPlaceholder}</div>` : DOMPurify.sanitize(selectedIssue.body)}
            </div>
            {#if isModalBodyEditing }
            <div class="flex flex-row mt-2 gap-2">
              <button class='btn-primary' on:click={modalBodySave}>저장</button>
              <button class='btn-outline' on:click={modalBodyCancel}>취소</button>
            </div>
            {/if}
          </div>
        </div>
        
        <div class="info-section flex flex-col gap-4 w-full md:w-72">
          <div>
            <div class="text-sm text-gray-800 w-14 mb-1 font-medium">상태</div>
            <Dropdown z={40}>
              <DropdownButton style={issueStatus[selectedIssue.status].btnClass}>
                {issueStatus[selectedIssue.status].label}
                <svg class="w-5 h-5 ml-2 -mr-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
              </DropdownButton>
              <DropdownMenu>
                {#each issueStatus as status, index (index)}
                  <DropdownItem on:click={handleModalStatusChange} >{status.label}</DropdownItem>
                {/each}
              </DropdownMenu>
            </Dropdown>
          </div>
          <div>
            <div class="text-sm text-gray-800 w-14 mb-1 font-medium">담당자</div>
            <Dropdown>
              <DropdownButton 
                on:click={loadProjectUsers}>
                {selectedIssue.assignee ? selectedIssue.assignee.username : "없음"}
                <svg class="w-5 h-5 ml-2 -mr-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
              </DropdownButton>
              <DropdownMenu>
                <DropdownItem on:click={()=>handleAssigneeChange(null)}>할당 해제</DropdownItem>
                {#each userList as user, index (index)}
                  <DropdownItem on:click={()=>handleAssigneeChange(index)}>{user.username}</DropdownItem>
                {/each}
              </DropdownMenu>
            </Dropdown>
          </div>
          <div class='flex flex-col'>
            <span class="text-sm text-gray-800 w-14 mb-1 font-medium">태그</span>
            <div class='flex flex-row gap-2'>
              <span class='label-gray'>백엔드</span>
              <span class='label-blue'>인증</span>
              <span class='label-green'>리뷰 필요</span>
            </div>
          </div>
        </div>

      </div>
      {/if}

    </ModalBody>
    <ModalFooter>
      <Nav tabpanels="tabpanels">
        <NavItem target="panel-1" active><span class="text-sm">댓글</span></NavItem>
        <NavItem target="panel-2"><span class="text-sm">히스토리</span></NavItem>
      </Nav>
      <div class="mt-2">
        <TabPanels id="tabpanels">
          <TabPanel id="panel-1" active>
            댓글
          </TabPanel>
          <TabPanel id="panel-2">
            히스토리
          </TabPanel>
        </TabPanels>
      </div>
    </ModalFooter>
  </Modal>
  {/if}
</section>
{/if}
<style>
  .dropdown:focus-within .dropdown-menu {
    opacity:1;
    transform: translate(0) scale(1);
    visibility: visible;
  }

</style>