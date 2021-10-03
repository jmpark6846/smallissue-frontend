<script>
import dayjs from 'dayjs'
import DOMPurify from "dompurify";
import { onMount } from "svelte";
import { useParams, link } from "svelte-navigator";
import Dropdown from "../../../components/Dropdown/Dropdown.svelte";
import DropdownButton from "../../../components/Dropdown/DropdownButton.svelte";
import DropdownItem from "../../../components/Dropdown/DropdownItem.svelte";
import DropdownMenu from "../../../components/Dropdown/DropdownMenu.svelte";
import Nav from "../../../components/Nav/Nav.svelte";
import NavItem from "../../../components/Nav/NavItem.svelte";
import TabPanel from "../../../components/Nav/TabPanel.svelte";
import TabPanels from "../../../components/Nav/TabPanels.svelte";
import TextareaEditable from "../../../components/TextareaEditable.svelte";
import user from "../../../store/user";
import api from "../../../utils/api";


const params = useParams();
$: PROJECT_URL = `/projects/${$params.project_id}/`;
$: ISSUE_DETAIL_URL = `/projects/${$params.project_id}/issues/${$params.issue_id}/`;
$: issue = {};
let editorEl;
let loading = true;
const issueStatus = [
  { label: "해야 할 일", btnClass: 'btn'}, 
  { label: "진행 중", btnClass: 'btn-blue'},
  { label: "완료됨", btnClass: 'btn-green'}
];

async function getIssue(){
  try {
    const res = await api.get(ISSUE_DETAIL_URL);
    issue = res.data;
    loading = false;
  } catch (error) {
    console.error(error);
  }
}

let commentLoading = false;
async function getComments(){
  commentLoading = true;
  try{
    const res = await api.get(ISSUE_DETAIL_URL+'comments/');
    comments = res.data
    commentLoading = false;
  }catch(error){
    console.error(error);
  }
}
onMount(async() => {
  await getIssue();
  await getComments();
});

async function handleModalStatusChange(e){
  let newStatus = Number(e.detail.index)
  issue.status = newStatus
  await updateIssue({ status: newStatus })
}

let userList = [];

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
  await updateIssue({assignee: assigneeId});

  if(assigneeId){
    issue.assignee = userList[index]
  }else{
    issue.assignee = null;
  }
}

async function updateIssue(updated){
  let data = { ...issue }
  data['project'] = data.project.id
  data['assignee'] = data.assignee ? data.assignee.id : null
  data = {...data, ...updated}
  try {
    const res = await api.put(ISSUE_DETAIL_URL, data);
    issue = res.data 
  } catch (error) {
    console.error(error);
  }
}
const placeholder = '내용을 입력해주세요.';
const editorSettings = {
    menubar: false,
    resize:true,
    placeholder,
    statusbar: false,
}


function tinymceloaded(elementId, content) {
  const ed = new tinymce.Editor(elementId, {
    ...editorSettings,
    auto_focus: elementId,
    setup: function(editor) {
      editor.on('init', function(e) {
        editor.setContent(content);
        if(editor.id === editorEl.id){
          isModalBodyEditing = true;
        }else if(editor.id === commentInputEl.id){
          isCommentEditing = true;
        }
      });
    }
  }, window.tinymce.EditorManager);

  ed.render();
}

function modalBodyClick(){
  tinymceloaded('editor', issue.body)
}
let isModalBodyEditing = false;

async function modalBodySave(){
  const editor = window.tinymce.get('editor');
  const content = editor.getContent()
  
  if(content ===''){
    return;
  }
  
  isModalBodyEditing = false;
  issue.body = content;
  await updateIssue({body: issue.body})
  editor.destroy()
  if(!issue.body){
    editorEl.innerHTML = `<div class='text-gray-500'>${placeholder}</div>`;
  }
}

function modalBodyCancel(){
  const editor = window.tinymce.activeEditor;
  editor.setContent(issue.body);
  isModalBodyEditing = false;
  editor.destroy()
  if(!issue.body){
    editorEl.innerHTML = `<div class='text-gray-500'>${placeholder}</div>`;
  }
}

let comments = [];
let commentInputEl;
let isCommentEditing = false;

function commentInputClick(){
  tinymceloaded('commentInput', '')
}

async function commentSave(editor_id, index){
  const editor = window.tinymce.get(editor_id);
  const content = editor.getContent()
  
  if(content === ''){
    return;
  }
  
  if(index !== undefined){
    comments[index].editing = false;
  }else{
    isCommentEditing = false;
  }
  
  const data = {
    content,
    author: $user.pk,
    issue: issue.id
  }
  try {
    const res = await api.post(ISSUE_DETAIL_URL+'comments/', data);
    comments = [res.data, ...comments]
  } catch (error) {
    console.error(error);
  }
  editor.destroy()
  const element = document.getElementById(editor_id)
  element.innerHTML = `<div class='text-gray-500'>${placeholder}</div>`;
}


async function commentUpdate(editor_id, index){
  const editor = window.tinymce.get(editor_id);
  const content = editor.getContent()
  let commentPlaceholder = "";

  if(content === ''){
    return;
  }
  
  if(index !== undefined){
    // 코멘트 수정 시
    comments[index].editing = false;
    commentPlaceholder = comments[index].content;
  }else{
    // 코멘트 입력부분
    isCommentEditing = false;
    commentPlaceholder = `<div class='text-gray-500'>${placeholder}</div>`;
  }
  
  const data = { ...comments[index], author: comments[index].author.id, content }
  try {
    const res = await api.put(ISSUE_DETAIL_URL+'comments/'+comments[index].id+'/', data);
    comments[index] = res.data
  } catch (error) {
    console.error(error);
  }
  editor.destroy()
  const element = document.getElementById(editor_id)
  element.innerHTML = commentPlaceholder;
}

function commentCancel(editor_id, index){
  const editor = window.tinymce.get(editor_id);
  let commentPlaceholder='';

  if(index !== undefined){
    // 코멘트 수정 시
    comments[index].editing = false;
    commentPlaceholder = comments[index].content
  }else{
    // 코멘트 입력부분
    isCommentEditing = false;
    commentPlaceholder = `<div class='text-gray-500'>${placeholder}</div>`;
  }
  editor.destroy()
  
  const element = document.getElementById(editor_id)
  element.innerHTML = commentPlaceholder
}

async function commentDeleteClick(comment_id){
  if(confirm('삭제하시겠습니까?')){
    try {
      const res = await api.delete(ISSUE_DETAIL_URL+'comments/'+comment_id);
      comments = comments.filter(c=>c.id !== comment_id);
      
    } catch (error) {
      console.error(error);
    }
  }
}
  
function commentUpdateClick(index){
  comments[index].editing = true;
  tinymceloaded('comment-'+comments[index].id, comments[index].content)
}


</script>

<svelte:head>
  {issue.title ? issue.title : "이슈 상세보기"}
</svelte:head>

{#if loading }
<section class='pt-4 px-4 md:px-0 grid gap-4 grid-cols-1 md:grid-cols-12 '> 
  
  <div class='title-section col-start-1 row-start-1 md:col-span-12 '>
    <div class='cp-text'></div>
    <div class='cp-text-long'></div>
  </div>
  <div class='main-section col-start-1 row-start-3 md:row-start-2 md:col-span-9 '>
    <div class="cp-paragraph card mb-4"></div>
    <div class="cp-paragraph card"></div>
  </div>
  <div class='card info-section col-start-1 row-start-2 md:col-start-10 md:col-span-3 md:row-span-1 md:row-start-2'>
    <div class="cp-paragraph"></div>
    <div class="cp-paragraph"></div>
  </div>
</section>
{:else}

<section class='pt-4 px-4 md:px-0 grid gap-4 grid-cols-1 md:grid-cols-12 '> 
  <div class='title-section col-start-1 row-start-1 md:col-span-12 '>
    <div class=' text-gray-500 mb-2'>
      <a href={PROJECT_URL} class=' hover:text-gray-700 mr-2' use:link>{issue.project.name}</a> / <a href={ISSUE_DETAIL_URL} class='ml-2 hover:text-gray-700' use:link>{issue.key}</a> 
    </div>
    <h1 class='text-3xl font-semibold -ml-1'>
      <TextareaEditable content={issue.title} on:change={(e)=>issue.title = e.detail.value}/>
    </h1>
  </div>

  <div class='main-section  col-start-1 row-start-3 md:row-start-2 md:col-span-9 '>
      <div class='body-section mb-4 card'>
        <div class="font-medium text-gray-800">설명</div>
        <div id="editor" bind:this={editorEl} class='p-1 hover:bg-gray-100 cursor-pointer rounded-md overflow -ml-1' on:click={modalBodyClick}>
          {@html issue.body ? DOMPurify.sanitize(issue.body) : `<div class='text-gray-500'>${placeholder}</div>`}
        </div>
    
        {#if isModalBodyEditing }
        <div class="flex flex-row mt-2 gap-2">
          <button class='btn-primary' on:click={modalBodySave}>저장</button>
          <button class='btn-outline' on:click={modalBodyCancel}>취소</button>
        </div>
        {/if}      
      </div>
      
      <div class="tab-section  card ">
        <div class="font-medium text-gray-800 mb-2">활동</div>

        <Nav tabpanels="tabpanels">
          <NavItem target="panel-1" active on:click={async()=>await getComments()}><span class="text-sm">댓글</span></NavItem>
          <NavItem target="panel-2" ><span class="text-sm">히스토리</span></NavItem>
        </Nav>
        <div class="mt-2">
          <TabPanels id="tabpanels">
            <TabPanel id="panel-1" active>
              <div id='commentInput' bind:this={commentInputEl} class='input mb-4' on:click={commentInputClick}>
                <div class='text-gray-500'>{placeholder}</div>
              </div>
              {#if isCommentEditing }
              <div class="flex flex-row mt-2 gap-2">
                <button class='btn-primary' on:click={()=>commentSave('commentInput')}>저장</button>
                <button class='btn-outline' on:click={()=>commentCancel('commentInput')}>취소</button>
              </div>
              {/if}      
              
              {#if commentLoading }
                loading...
              {:else}
                {#each comments as comment, index (index)}
                <div class='mb-5 '>
                  <div class='font-medium'>{comment.author.username}<span class='ml-2 text-sm text-gray-500'>{dayjs(comment.updated_at).fromNow()}</span></div>
                  <div id={`comment-${comment.id}`}>{@html DOMPurify.sanitize(comment.content)}</div>
                  {#if comment.editing }
                  <div class="flex flex-row mt-2 gap-2">
                    <button class='btn-primary' on:click={()=>commentUpdate('comment-'+comment.id, index)}>저장</button>
                    <button class='btn-outline' on:click={()=>commentCancel('comment-'+comment.id, index)}>취소</button>
                  </div>
                  {:else if comment.author.id === $user.pk }
                  <div class="flex flex-row gap-2 text-sm text-gray-700 ">
                    <div class='hover:text-gray-900 cursor-pointer' on:click={async ()=> await commentDeleteClick(comment.id)}>삭제</div>
                    <div class='hover:text-gray-900 cursor-pointer' on:click={()=>commentUpdateClick(index)}>수정</div>
                  </div>
                  {/if}
                </div>
                {/each}
              {/if}
            </TabPanel>
            <TabPanel id="panel-2">
              히스토리
            </TabPanel>
          </TabPanels>
        </div>
      </div>
    
  </div>

  <div class='info-section col-start-1 row-start-2 md:col-start-10 md:col-span-3 md:row-span-1 md:row-start-2'>
    <div class='card flex flex-col gap-4'>
      <div class='font-medium text-gray-800'>세부사항</div>
      <div class="status-section">
        <div class="text-sm text-gray-600 w-14 mb-1 font-medium">상태</div>
        <Dropdown z={50}>
          <DropdownButton style={issueStatus[issue.status].btnClass}>
            {issueStatus[issue.status].label}
            <svg class="w-5 h-5 ml-2 -mr-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
          </DropdownButton>
          <DropdownMenu>
            {#each issueStatus as status, index (index)}
              <DropdownItem on:click={handleModalStatusChange} >{status.label}</DropdownItem>
            {/each}
          </DropdownMenu>
        </Dropdown>
      </div>
      <div class="assignee-section">
        <div class="text-sm text-gray-600 w-14 mb-1 font-medium">담당자</div>
          <Dropdown z={40}>
            <DropdownButton 
              on:click={loadProjectUsers}>
              {issue.assignee ? issue.assignee.username : "없음"}
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
      
      <div class='tag-section flex flex-col'>
        <span class="text-sm text-gray-600 w-14 mb-1 font-medium">태그</span>
        <div class='flex flex-row flex-wrap gap-2'>
          <span class='label-gray'>백엔드</span>
          <span class='label-blue'>인증</span>
          <span class='label-green'>리뷰 필요</span>
        </div>
      </div>

  </div>
    
  </div>
</section>



{/if}