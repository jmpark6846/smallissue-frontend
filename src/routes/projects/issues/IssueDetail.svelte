<script>
import { PaginationNav } from 'svelte-paginate'
import Tags from "svelte-tags-input";
import dayjs from 'dayjs'
import DOMPurify from "dompurify";
import { onMount } from "svelte";
import { useParams, link, navigate } from "svelte-navigator";
import Nav from "../../../components/Nav/Nav.svelte";
import NavItem from "../../../components/Nav/NavItem.svelte";
import TabPanel from "../../../components/Nav/TabPanel.svelte";
import TabPanels from "../../../components/Nav/TabPanels.svelte";
import TextareaEditable from "../../../components/TextareaEditable.svelte";
import user from "../../../store/user";
import api from "../../../utils/api";
import truncateString from '../../../utils/truncateString';
import Dropdown from '../../../components/Dropdown/Dropdown.svelte'
import DropdownMenu from '../../../components/Dropdown/DropdownMenu.svelte'
import { issueStatus } from '../../../utils/common';

export let id=null;
export let onIssueChange;
export let onClose;
export let onDelete;
const params = useParams();

let issue = {};
let PROJECT_URL=null;
let ISSUE_DETAIL_URL=null;
let editorEl;
let loading = true;
let commentLoading = true;
let userList = [];
let isModalBodyEditing = false;

let comments = { list: [], count: null, page_size: null, current_page: null };
let currentCommentPage = 1;
let commentInputEl;
let isCommentEditing = false;

let history = { list: [], count: null, page_size: null, current_page: null };
let historyLoading = true;
let currentHistoryPage = 1;
let tags = [];
let isTagEditing = false;

const placeholder = '내용을 입력해주세요.';
const editorSettings = {
    menubar: false,
    resize:true,
    placeholder,
    statusbar: false,
}
const issueAttrNames = {
  title: '제목',
  body: '설명',
  assignee: '담당자',
  status: '상태',
  tags:'태그'
}

$:{
  loading = true;
  if(id){
    PROJECT_URL = `/projects/${$params.id}/`;
    ISSUE_DETAIL_URL = `/projects/${$params.id}/issues/${id}/`;

    Promise.all([
      api.get(ISSUE_DETAIL_URL),
      api.get(ISSUE_DETAIL_URL+'comments/?page_num=1')
    ])
    .then(res=>{
      issue = res[0].data
      comments = res[1].data
      loading = false;
      commentLoading = false;
    }).catch(error => error) 
  }
}

async function getIssue(){
  try {
    const res = await Promise.all([
      api.get(ISSUE_DETAIL_URL),
    ]);
    issue = res[0].data;
    loading = false;
  } catch (error) {
    console.error(error);
  }
}

async function getComments(page_num){
  commentLoading = true;
  try{
    const res = await api.get(ISSUE_DETAIL_URL+'comments/?page_num='+page_num);
    comments = res.data
    commentLoading = false;
  }catch(error){
    console.error(error);
  }
}

onMount(async() => {
  
});

async function handleTitleChange(e){
  issue.title = e.detail.value
  await updateIssue({ title: e.detail.value })
}

async function handleModalStatusChange(index){
  issue.status = index
  await updateIssue({ status: index })
}


async function loadProjectUsers(){
  try {
    const res = await api.get(`projects/${$params.id}/users`);
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
    onIssueChange(issue, );
  } catch (error) {
    console.error(error);
  }
}

function tinymceloaded(elementId, content) {
  const ed = new tinymce.Editor(elementId, {
    ...editorSettings,
    auto_focus: elementId,
    setup: function(editor) {
      editor.on('init', function(e) {
        if(!content){
          content = ""
        }
        editor.setContent(content);
        if(editor.id === editorEl.id){
          isModalBodyEditing = true;
          console.log(isModalBodyEditing)
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


async function modalBodySave(){
  const editor = window.tinymce.get('editor');
  const content = editor.getContent()
  
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
  if(issue.body){
    editor.setContent(issue.body);
  }
  isModalBodyEditing = false;
  editor.destroy()
  if(!issue.body){
    editorEl.innerHTML = `<div class='text-gray-500'>${placeholder}</div>`;
  }
}



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
    comments.list[index].editing = false;
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
    comments.list = [res.data, ...comments.list]
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
    comments.list[index].editing = false;
    commentPlaceholder = comments.list[index].content;
  }else{
    // 코멘트 입력부분
    isCommentEditing = false;
    commentPlaceholder = `<div class='text-gray-500'>${placeholder}</div>`;
  }
  
  const data = { ...comments.list[index], author: comments.list[index].author.id, content }
  try {
    const res = await api.put(ISSUE_DETAIL_URL+'comments/'+comments.list[index].id+'/', data);
    comments.list[index] = res.data
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
    comments.list[index].editing = false;
    commentPlaceholder = comments.list[index].content
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
      comments.list = comments.list.filter(c=>c.id !== comment_id);
      
    } catch (error) {
      console.error(error);
    }
  }
}
  
function commentUpdateClick(index){
  comments.list[index].editing = true;
  tinymceloaded('comment-'+comments.list[index].id, comments.list[index].content)
}

async function getHistory(page_num){
  historyLoading = true;
  try {
    const res = await api.get(ISSUE_DETAIL_URL+'history/?history_page='+page_num);
    history = res.data
    historyLoading = false;
  } catch (error) {
    console.error(error)
  }
}

function stripTags(htmlStr){
  const dom = new DOMParser().parseFromString(htmlStr, 'text/html');
  const txt = dom.body.textContent;
  return txt
}

async function handleTags(event) {
  const data = { tags: event.detail.tags }
  try {
    const res = await api.post(ISSUE_DETAIL_URL+'tags/', data)
    issue.tags = res.data.tags
  } catch (error) {
    console.error(error);
  }
}
async function deleteIssue(){
  if(confirm('이슈를 삭제하시겠습니까?')){
    try {
      await api.delete(ISSUE_DETAIL_URL);
      onDelete(issue.id)
    } catch (error) {
      console.error(error);
    }
  }
}

async function toggleSubscription(){
  try{
    const res = await api.patch(ISSUE_DETAIL_URL+'toggle_subscription/')
    issue.subscribers = res.data.subscribers
  }catch{
    console.error(error);
  }

}

</script>

<svelte:head>
  {issue.title ? issue.title : "이슈 상세보기"}
</svelte:head>

{#if loading }
<section class='py-2'> 
  <div class="py-2">
    <div class="px-4">
      <div class='cp-text'></div>
    </div>
    
  </div>
  <div class='title-section py-0'>
    <div class="px-4 mb-4">
      <div class='cp-text'></div>
    </div>
  </div>
  <div class='main-section py-2'>
    <div class="px-4 mb-4">
      <div class="cp-paragraph"></div>
    </div>
  </div>
  <div class='info-section py-2'>
    <div class="px-4 mb-4">
      <div class="cp-paragraph"></div>
      <div class="cp-paragraph"></div>
    </div>
  </div>
</section>
{:else}

<section class="py-2"> 
  <div class="topbar-section py-2">
    <div class='px-4 flex justify-between items-center'>
      <div class='text-gray-500'>{issue.key}</div>
      <div>
        <div class='rounded-lg cursor-pointer inline-block hover:bg-gray-100 px-2 py-2' on:click={deleteIssue}>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <div class='subscribe-btn rounded-lg cursor-pointer inline-block hover:bg-gray-100 px-2 py-2' on:click={toggleSubscription}>
          {#if issue.subscribers.includes($user.pk)}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
          </svg>
          {:else}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {/if}
        </div>
        <div class='rounded-lg cursor-pointer inline-block hover:bg-gray-100 px-2 py-2' on:click={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </div>
        
      </div>
      
    </div>
  </div>
  <div class='title-section py-0'>
    <div class="px-4">
      <h1 class='text-2xl font-semibold -ml-1'>
        <TextareaEditable content={issue.title} on:change={handleTitleChange}/>
      </h1>
    </div>
  </div>

  <div class='info-section py-2'>
    <div class='px-4 flex space-x-4'>
      <div class="status-section w-1/3">
        <div class="font-medium text-gray-800 mb-1">상태</div>
        <Dropdown>
          <div class={`flex items-center rounded-lg px-4 py-2 cursor-pointer ${issueStatus[issue.status].btnClass}`}>
            <span>{issueStatus[issue.status].label}</span>
            <span>
              <svg class="w-5 h-5 ml-2 -mr-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
            </span>
          </div>
        </Dropdown>
        <DropdownMenu>
          {#each issueStatus as status, index (index)}
            <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" on:click={()=>handleModalStatusChange(index)}>{status.label}</div>
          {/each}
        </DropdownMenu>
      </div>
      <div class="assignee-section w-1/3">
        <div class="font-medium text-gray-800 mb-1">담당자</div>
        <div>
          <Dropdown on:click={loadProjectUsers}>
            <div class="flex items-center rounded-lg px-4 py-2 bg-gray-100 hover:bg-gray-200 focus:bg-gray-300 cursor-pointer">
              <span>{issue.assignee ? issue.assignee.username : "없음"}</span>
              <span>
                <svg class="w-5 h-5 ml-2 -mr-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
              </span>
            </div>
          </Dropdown>
          <DropdownMenu>
            <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" on:click={()=>handleAssigneeChange(null)}>할당 해제</div>
            {#each userList as user, index (index)}
              <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer" on:click={()=>handleAssigneeChange(index)}>{user.username}</div>
            {/each}
          </DropdownMenu>
        </div>
      </div>
    </div>
  </div>

  <div class='main-section py-2'>
      <div class='body-section px-4 py-2'>
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
      
      <div class='tag-section px-4 py-2'>
        <div class="text-gray-800 mb-1 font-medium">태그</div>
        <div class="tag-container">
          <Tags tags={issue.tags} on:tags={handleTags}/>
        </div>
      </div>
      <div class="tab-section px-4 py-2">
        <div class="font-medium text-gray-800 mb-2">활동</div>

        <Nav tabpanels="tabpanels">
          <NavItem target="panel-1" active on:click={async()=>await getComments(1)}><span class="text-sm cursor-pointer">댓글</span></NavItem>
          <NavItem target="panel-2" on:click={async()=>await getHistory(1)}><span class="text-sm cursor-pointer">히스토리</span></NavItem>
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
                {#each comments.list as comment, index (index)}
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
                <div class="page-nav">
                  <PaginationNav
                    totalItems="{comments.count}"
                    pageSize="{comments.page_size}"
                    currentPage="{currentCommentPage}"
                    limit="{2}"
                    showStepOptions="{false}"
                    on:setPage="{async (e) => {currentCommentPage = e.detail.page; await getComments(currentCommentPage);}}"
                  />
                </div>
              {/if}
            </TabPanel>
            <TabPanel id="panel-2">
              {#if historyLoading }
                loading..
              {:else} 
                {#each history.list as h }
                <div class="mb-5">
                  {#if h.field === 'tags'}
                    {#if h.type === "+"}
                    <div>
                      <div>
                        <span class='font-medium'>{h.user.username}</span> {issueAttrNames[h.field]} 추가됨<span class='ml-2 text-sm text-gray-500'>{dayjs(h.date).fromNow()}</span>
                      </div> 
                      <div class='flex items-center gap-1'>
                        <div class='label-gray'style='word-break: keep-all;'>{h.new_value}</div>
                      </div>
                    </div>
                    {:else if h.type === "-"}
                    <div>
                      <div>
                        <span class='font-medium'>{h.user.username}</span> {issueAttrNames[h.field]} 삭제됨<span class='ml-2 text-sm text-gray-500'>{dayjs(h.date).fromNow()}</span>
                      </div> 
                      <div class='flex items-center gap-1'>
                        <div class='label-gray' style='word-break: keep-all;'>{h.new_value}</div>
                      </div>
                    </div>
                    {/if}
                  {:else}
                    {#if h.type === '+'}
                    <div>
                      <span class='font-medium'>{h.user.username}</span> 이슈 생성됨<span class='ml-2 text-sm text-gray-500'>{dayjs(h.date).fromNow()}</span>
                    </div>
                    {:else}
                    <div>
                      <div>
                        <span class='font-medium'>{h.user.username}</span> {issueAttrNames[h.field]} 업데이트됨<span class='ml-2 text-sm text-gray-500'>{dayjs(h.date).fromNow()}</span>
                      </div> 
                      <div class='flex items-center gap-1'>
                        {#if h.field === 'assignee'}
                        <div class=''>{h.old_value.username || "없음"}</div>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 min-w-min" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                        <div class=''>{h.new_value.username || "없음"}</div>
    
                        {:else if h.field === 'body'}
                        <div style='word-break: keep-all;'>{truncateString(stripTags(h.old_value), 200) || "없음"}</div>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 min-w-min" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                        <div style='word-break: keep-all;'>{truncateString(stripTags(h.new_value), 200) || "없음"}</div>
    
                        {:else if h.field === 'status'}
                        <div style='word-break: keep-all;'>{stripTags(issueStatus[h.old_value].label) || "없음"}</div>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 min-w-min" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                        <div style='word-break: keep-all;'>{stripTags(issueStatus[h.new_value].label) || "없음"}</div>
    
                        {:else if h.field === 'title'}
                        <div style='word-break: keep-all;'>{h.old_value || "없음"}</div>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 min-w-min" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                        <div style='word-break: keep-all;'>{h.new_value || "없음"}</div>
                        {/if}
                        
                      </div>
                    </div>
                    {/if}
                  {/if}
                </div>
                {/each}
              
                <div class="page-nav">
                  <PaginationNav
                    totalItems="{history.count}"
                    pageSize="{history.page_size}"
                    currentPage="{currentHistoryPage}"
                    limit="{2}"
                    showStepOptions="{false}"
                    on:setPage="{async (e) => {currentHistoryPage = e.detail.page; await getHistory(currentHistoryPage);}}"
                  />
                </div>

              {/if}
            </TabPanel>
          </TabPanels>
        </div>
      </div>
    
  </div>
</section>
{/if}

<style>
.tag-container :global(.svelte-tags-input-tag) {
  /* @apply label-gray; */
}
     
.tag-container :global(.svelte-tags-input-tag-remove){
  margin-left: 6px;  
  font-weight: 700;
}

.tag-container :global(.svelte-tags-input-layout) {
  /* background:yellow; */
}
</style>