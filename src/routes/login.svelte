<script>
import { useNavigate, useLocation } from "svelte-navigator";
import Button from '../components/Button.svelte';
import user, { notification } from '../store/user';
import api from '../utils/api';

const navigate = useNavigate();
const location = useLocation();
const demousers = [
  { email: 'project_leader@project.co', password: 'project_leader' },
  { email: 'project_user@project.co', password: 'project_user' },
  { email: 'readonly@readonly.com', password: 'readonly' }
]

function getUnreadCount(){
  return api.get('inbox/notifications/api/unread_count/');
}

let errorMessage = '';

async function login_demo(demouser_index){
  const res = await api.post('accounts/login/', demousers[demouser_index]);
  if(res.status === 200){
    user.set(res.data.user);
    const notiCountRes = await getUnreadCount();
    if(notiCountRes.status === 200){
      notification.update(v=>({...v, unread_count: notiCountRes.data.unread_count}));
    }
    navigate("/projects", { replace: true });
  }else{
    errorMessage="로그인에 실패했습니다."
  }
}
  
</script>

<svelte:head>
  <title>로그인</title>
</svelte:head>

<section class='flex flex-col items-center my-12'>
  <h1 class='text-center text-5xl font-extrabold pb-10'>smallissue</h1>
  <div class='login-box flex flex-col px-7'>
    <div class="space-y-2 flex flex-col">
      <!-- <Button>구글로 시작하기</Button>
      <Button>깃헙으로 시작하기</Button> -->
      <button class='px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white hover:bg-blue-100' on:click={async ()=> await login_demo(0)}>프로젝트 리더로 시작하기</button>
      <button class='px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white hover:bg-blue-100' primary on:click={async ()=>await login_demo(1)}>프로젝트 팀원으로 시작하기</button>
      <button class='px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white hover:bg-blue-100' primary on:click={async ()=>await login_demo(2)}>읽기전용 사용자로 시작하기</button>
    </div>
    
  </div>
</section>

<style>
.login-box{
  width: 400px;
}

</style>