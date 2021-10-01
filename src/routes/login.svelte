<script>
import { useNavigate, useLocation } from "svelte-navigator";
import Button from '../components/Button.svelte';
import user from '../store/user';
import api from '../utils/api';

const navigate = useNavigate();
const location = useLocation();


let errorMessage = '';

async function login_demo(){
  const demo_user = { email: 'demouser@naver.com', password: 'demouser' };
  const res = await api.post('accounts/login/', demo_user);
  if(res.status === 200){
    user.set(res.data.user);
    const from = ($location.state && $location.state.from) || "/projects";
    navigate(from, { replace: true });
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
      <Button primary on:click={login_demo}>데모유저로 시작하기</Button>
      <div class:hidden={errorMessage === ''} class='bg-red-600 text-white rounded-md px-4 py-2'>{errorMessage}</div>
    </div>
    
  </div>
</section>

<style>
.login-box{
  width: 400px;
}

</style>