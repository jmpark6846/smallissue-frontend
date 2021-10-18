<script>
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
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
import api, { fileDownload } from "../../../utils/api";
import truncateString from '../../../utils/truncateString';
import Dropdown from '../../../components/Dropdown/Dropdown.svelte'
import DropdownMenu from '../../../components/Dropdown/DropdownMenu.svelte'
import { issueStatus, stripTags } from '../../../utils/common';
import '../../../prism'

export let id=null;
export let status = null;
export let assignee = null;
export let onIssueChange;
export let onClose;
export let onDelete;
let PROJECT_URL=null;
let ISSUE_DETAIL_URL=null;
const params = useParams();
let loading = true;

let issue = {};
$:issue.status=status;
$:issue.assignee=assignee;

let editorInstances = [];
let editorEl;
let userList = [];
let isModalBodyEditing = false;

let isActivityLoading = true
let comments = { list: [], count: 0, page_size: 1, current_page: 1 };
let commentInputEl;
let isCommentEditing = false;

let history = { list: [], count: 0, page_size: 1, current_page: 1 };
let attachments = { list: [], count: 0, page_size: 1, current_page: 1 };
let fileInputEl;

const placeholder = '내용을 입력해주세요.';
const editorSettings = {
    menubar: false,
    resize:true,
    placeholder,
    statusbar: false,
    plugins: 'lists advlist codesample importcss',
    toolbar: 'undo redo styleselect bold bullist numlist codesample',
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
  isModalBodyEditing = false;
  isCommentEditing = false;
  editorInstances.forEach(editor => editor.destroy());
  editorInstances = [];

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
      isActivityLoading = false;
    }).catch(error => error) 
  }
}

$:{
  if(editorEl){
    Prism.highlightAllUnder(editorEl)
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

async function getComments(page_num=1){
  isActivityLoading = true;
  try{
    const res = await api.get(ISSUE_DETAIL_URL+'comments/?page_num='+page_num);
    comments = res.data
    isActivityLoading = false;
  }catch(error){
    console.error(error);
  }
}


const s3 = new S3Client({
  region: SI_AWS_REGION,
  credentials: {
    accessKeyId: SI_AWS_ACCESS_KEY_ID,
    secretAccessKey: SI_AWS_SECRET_ACCESS_KEY, 
  }
})

const command = new GetObjectCommand({
    Bucket: SI_AWS_STORAGE_BUCKET_NAME,
    Key: "editor_content_body.css"
});

onMount(async() => {
  
});

async function handleTitleChange(e){
  await updateIssue({ title: e.detail.value })
}

async function handleModalStatusChange(index){
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
}

async function updateIssue(updated){
  let data = { ...issue }
  data['project'] = data.project.id
  data['assignee'] = data.assignee ? data.assignee.id : null
  data = {...data, ...updated}
  try {
    const res = await api.put(ISSUE_DETAIL_URL, data);
    issue = res.data 
    onIssueChange(res.data);
  } catch (error) {
    console.error(error);
  }
}

async function tinymceloaded(elementId, content) {
  let stylesheetUrl;
  try {
    stylesheetUrl = await getSignedUrl(s3, command, { expiresIn: 3600 })
  } catch (error) {
    console.error(error);
  }
  const ed = new tinymce.Editor(elementId, {
    ...editorSettings,
    content_css: stylesheetUrl,
    content_css_cors: true,
    auto_focus: elementId,
    
    body_class: 'editor_content_body',
    setup: function(editor) {
      editor.on('init', function(e) {
        editorInstances.push(editor)

        if(!content){
          content = ""
        }
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
  tinymceloaded('body-editor', issue.body)
}

async function modalBodySave(){
  const editor = window.tinymce.get('body-editor');
  const content = editor.getContent()
  
  isModalBodyEditing = false;
  await updateIssue({body: content})
  editor.destroy()
  if(!issue.body){
    editorEl.innerHTML = `<div class='text-gray-500'>${placeholder}</div>`;
  }
  Prism.highlightAllUnder(editorEl)
}

function modalBodyCancel(){
  const editor = window.tinymce.get('body-editor');
  if(issue.body){
    editor.setContent(issue.body);
  }
  isModalBodyEditing = false;
  editor.destroy()
  if(!issue.body){
    editorEl.innerHTML = `<div class='text-gray-500'>${placeholder}</div>`;
  }
  Prism.highlightAllUnder(editorEl)

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
  isActivityLoading = true;
  try {
    const res = await api.get(ISSUE_DETAIL_URL+'history/?page_num='+page_num);
    history = res.data
    isActivityLoading = false;
  } catch (error) {
    console.error(error)
  }
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
async function getAttachments(page_num){
  const params = {
    page_num,
    issue: id
  }

  isActivityLoading = true;
  try {
    const res = await api.get(PROJECT_URL+'attachments/', { params });
    attachments = res.data
    isActivityLoading = false;
  } catch (error) {
    console.error(error)
  }
}

async function handleAttachmentDownload(url, filename){
  try {
    await fileDownload(url, filename)
  } catch (error) {
    console.error(error);
  }
}

const onFileSelected = (e)=>{
  // const fileUploadButtonDiv = document.getElementById('file-upload-button');
  // fileUploadButtonDiv.innerHTML = e.target.files[0].name
  handleFileUpload()
}

async function handleFileUpload(){
  if(fileInputEl.files.length !== 0){
    const formData = new FormData();
    formData.append('file', fileInputEl.files[0]);
    formData.append('author', $user.pk);
    formData.append('project', $params.id);
    formData.append('content_type_string', 'issue');
    formData.append('content_id', id);
  
    try {
      const res = await api.post(PROJECT_URL+'attachments/', formData, { headers: { 'Content-Type': 'multipart/form-data'}});
      attachments.list = [ res.data, ...attachments.list ]

    } catch (error) {
      console.error(error);
    }
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

<section class="py-2 bg-white"> 
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
    <div class='px-4 flex flex-wrap space-x-4'>
      <div class="status-section">
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
      <div class="assignee-section">
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
      <div id="body-editor" bind:this={editorEl} class='p-1 hover:bg-gray-100 cursor-pointer rounded-md overflow-x-auto -ml-1 w-full editor_content_body' on:click={modalBodyClick}>
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
        <Tags tags={issue.tags} on:tags={handleTags} disable={$user.is_readonly} />
      </div>
    </div>
    <div class="tab-section px-4 py-2">
      <div class="font-medium text-gray-800 mb-2">활동</div>

      <Nav tabpanels="tabpanels">
        <NavItem target="panel-1" active on:click={async()=>await getComments(1)}><span class="text-sm cursor-pointer">댓글</span></NavItem>
        <NavItem target="panel-2" on:click={async()=>await getAttachments(1)}><span class="text-sm cursor-pointer">첨부파일</span></NavItem>
        <NavItem target="panel-3" on:click={async()=>await getHistory(1)}><span class="text-sm cursor-pointer">히스토리</span></NavItem>
      </Nav>
      <div class="mt-2">
        <TabPanels id="tabpanels">
          <TabPanel id="panel-1" active>
            <div id='commentInput' bind:this={commentInputEl} class='input text-sm mb-4 cursor-text' on:click={commentInputClick}>
              <div class='text-gray-500'>{placeholder}</div>
            </div>
            {#if isCommentEditing }
            <div class="flex flex-row mt-2 gap-2">
              <button class='btn-primary' on:click={()=>commentSave('commentInput')}>저장</button>
              <button class='btn-outline' on:click={()=>commentCancel('commentInput')}>취소</button>
            </div>
            {/if}      
            
            {#if isActivityLoading }
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
                  currentPage="{comments.current_page}"
                  limit="{2}"
                  showStepOptions="{false}"
                  on:setPage="{async (e) => await getComments(e.detail.page)}"
                />
              </div>
            {/if}
          </TabPanel>
          <TabPanel id="panel-2">
            {#if isActivityLoading }
              loading...
            {:else}
              <div class='mb-4'>
                <div id='file-upload-button' class="bg-gray-100 rounded px-4 py-4 cursor-pointer hover:bg-gray-200" on:click={()=>fileInputEl.click()}>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>첨부파일 업로드 하기</span>
                </div>
                <input class='hidden' bind:this={fileInputEl} type="file" accept="*" on:change={(e)=>onFileSelected(e)}>
              </div>

              {#each attachments.list as atc, index (index)}
              <div class='mb-5'>
                <div class='font-medium mb-1'>{atc.author.username}<span class='ml-2 text-sm text-gray-500'>{dayjs(atc.uploaded_at).fromNow()}</span></div>
                  <div class='border bg-white rounded px-2 py-2 cursor-pointer hover:bg-gray-100'  on:click={async () => await handleAttachmentDownload(atc.file, atc.filename)}> 
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {truncateString(atc.filename, 80)}
                  </div>
              </div>
              {/each}
              <div class="page-nav">
                <PaginationNav
                  totalItems="{attachments.count}"
                  pageSize="{attachments.page_size}"
                  currentPage="{attachments.current_page}"
                  limit="{2}"
                  showStepOptions="{false}"
                  on:setPage="{async (e) => await getAttachments(e.detail.page)}"
                />
              </div>
            {/if}
          </TabPanel>
          <TabPanel id="panel-3">
            {#if isActivityLoading }
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
                    <div class='flex items-center gap-1 border rounded px-2 py-2'>
                      <div class='label-gray'style='word-break: keep-all;'>{h.new_value}</div>
                    </div>
                  </div>
                  {:else if h.type === "-"}
                  <div>
                    <div>
                      <span class='font-medium'>{h.user.username}</span> {issueAttrNames[h.field]} 삭제됨<span class='ml-2 text-sm text-gray-500'>{dayjs(h.date).fromNow()}</span>
                    </div> 
                    <div class='flex items-center gap-1 border rounded px-2 py-2'>
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
                    <div class='flex items-center gap-1 border rounded px-2 py-2'>
                      {#if h.field === 'assignee'}
                      <div style="overflow-wrap: anywhere;">{h.old_value.username || "없음"}</div>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 min-w-min" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                      <div style='overflow-wrap: anywhere;'>{h.new_value.username || "없음"}</div>
  
                      {:else if h.field === 'body'}
                      <div style='overflow-wrap: anywhere;'>{truncateString(stripTags(h.old_value), 200) || "없음"}</div>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 min-w-min" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                      <div style='overflow-wrap: anywhere;'>{truncateString(stripTags(h.new_value), 200) || "없음"}</div>
  
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
                  currentPage="{history.current_page}"
                  limit="{2}"
                  showStepOptions="{false}"
                  on:setPage="{async (e) => await getHistory(e.detail.page)}"
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
.tag-container :global(.svelte-tags-input-tag-remove){
  margin-left: 6px;  
  font-weight: 700;
}
</style>