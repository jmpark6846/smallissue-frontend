
<script>
import Modal from '$components/Modal/index.svelte';
import ModalBody from '../../components/Modal/ModalBody.svelte';
import ModalFooter from '../../components/Modal/ModalFooter.svelte';
import ModalTitle from '../../components/Modal/ModalTitle.svelte';

let modal;

let open = false;
  
function toggle(e){
  open = !open
}
function submit(){
  console.log('submit')
}
</script>

<svelte:head>
  <title>프로젝트</title>
</svelte:head>

<section class='px-4 md:px-6 py-5'>
  <div class="flex flex-row justify-between  mb-5">
    <h1 class='text-2xl font-semibold'>프로젝트</h1>
    <button class="btn-primary flex items-center" on:click={toggle}>만들기</button>
  </div>

  <Modal modal={modal} open={open} toggle={toggle}>
    <ModalTitle>프로젝트 만들기</ModalTitle>
    <ModalBody>
      <div class="flex flex-col gap-1">
        <label for="project-title" class="text-gray-500">이름</label>
        <input name='project-title' class="input" type="text" aria-label="project-title" />
      </div>
    </ModalBody>
    <ModalFooter>
      <button class="btn"  on:click={toggle}>취소</button>
      <button class="btn-primary modal-close" on:click={submit}>확인</button>
    </ModalFooter>
  </Modal>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div class='card'>
      <div class="font-medium">
        프로젝트1
      </div>
    </div>
    <div class='border rounded-md shadow-sm bg-white py-3 px-4'>
      프로젝트1
    </div>
    <div class='border rounded-md shadow-sm bg-white py-3 px-4'>
      프로젝트1
    </div>
    <div class='border rounded-md shadow-sm bg-white py-3 px-4'>
      프로젝트1
    </div>
    <div class='border rounded-md shadow-sm bg-white py-3 px-4'>
      프로젝트1
    </div>
  </div>
</section>
