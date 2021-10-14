<script>
import { useNavigate, useLocation } from "svelte-navigator";
import Button from '../components/Button.svelte';
import user, { notification } from '../store/user';
import api from '../utils/api';

const navigate = useNavigate();
const location = useLocation();
const demousers = [
  { email: 'demouser@naver.com', password: 'demouser' },
  { email: 'chulsoo@naver.com', password: 'chulsoo' },
  { email: 'demouser3@naver.com', password: 'demouser3' }
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
  <title>Login</title>
</svelte:head>

<section class='flex flex-col items-center my-5'>
  <div class='login-box flex flex-col rounded-md bg-white py-9 px-7 border'>
    <h1 class='text-center text-xl pb-5'>Login</h1>
    <div class="space-y-2 flex flex-col">
      <Button>구글로 시작하기</Button>
      <Button>깃헙으로 시작하기</Button>
      <Button primary on:click={async ()=> await login_demo(0)}>데모유저로 시작하기</Button>
      <Button primary on:click={async ()=>await login_demo(1)}>데모유저2로 시작하기</Button>
      <Button primary on:click={async ()=>await login_demo(2)}>데모유저3(읽기전용)으로 시작하기</Button>
      <div class:hidden={errorMessage === ''} class='bg-red-600 text-white rounded-md px-4 py-2'>{errorMessage}</div>
    </div>
    
  </div>
</section>

<style>
.login-box{
  width: 400px;
}

</style>