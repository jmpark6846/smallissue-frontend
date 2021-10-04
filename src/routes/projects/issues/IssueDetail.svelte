<script>
import { paginate, PaginationNav } from 'svelte-paginate'
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
import truncateString from '../../../utils/truncateString';


const params = useParams();
$: PROJECT_URL = `/projects/${$params.project_id}/`;
$: ISSUE_DETAIL_URL = `/projects/${$params.project_id}/issues/${$params.issue_id}/`;
$: issue = {};
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
}
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

async function getComments(page_num){
  commentLoading = true;
  try{
    const res = await api.get(ISSUE_DETAIL_URL+'comments/?comment_page_num='+page_num);
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

async function handleTitleChange(e){
  issue.title = e.detail.value
  await updateIssue({ title: e.detail.value })
}

async function handleModalStatusChange(e){
  let newStatus = Number(e.detail.index)
  issue.status = newStatus
  await updateIssue({ status: newStatus })
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
  editor.setContent(issue.body);
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
      <TextareaEditable content={issue.title} on:change={handleTitleChange}/>
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
          <NavItem target="panel-2" on:click={async()=>await getHistory(1)}><span class="text-sm">히스토리</span></NavItem>
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
                <div class="history-page-nav">
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
                </div>
                {/each}
                
                <div class="history-page-nav">
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