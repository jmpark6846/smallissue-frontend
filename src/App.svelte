<script>
import './utils/dropdown';
import dayjs from 'dayjs'
import 'dayjs/locale/ko';
import Notifications from 'svelte-notifications';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Router, Route } from 'svelte-navigator';
import PrivateRoute from './components/PrivateRoute/PrivateRoute.svelte';
import Index from './routes/index.svelte';
import Layout from "./routes/layout.svelte";
import Login from './routes/login.svelte';
import ProjectList from './routes/projects/ProjectList.svelte';
import IssueList from './routes/projects/issues/IssueList.svelte';
import Example from './routes/example.svelte';
import IssueDetail from './routes/projects/issues/IssueDetail.svelte';
import UserList from './routes/projects/UserList.svelte';
import api from './utils/api';
import ProjectSettings from './routes/projects/ProjectSettings.svelte';
import { appNoti, project } from './store';
import Notfound404 from './routes/NotFound404.svelte';
import Profile from './routes/profile.svelte';
import truncateString from './utils/truncateString';

dayjs.locale('ko');
dayjs.extend(relativeTime);
api.defaults.baseURL = BASE_URL;

</script>
	
<svelte:head>
	<script src="https://cdn.tiny.cloud/1/hc0aj9chontfnpqrhoue1ms95l96pb9tcm1uroo8447dr9ek/tinymce/5/tinymce.min.js" referrerpolicy="origin" ></script>
</svelte:head>

<Notifications>
<Router>
	<Route path='/login'>
		<Login />
	</Route>
	<Route path='/example' component={Example} />
	<PrivateRoute path="projects/:id/settings/" let:location>
		<Layout>
			<h1 slot='header'>프로젝트 설정</h1>     
			<ProjectSettings slot="body"/>
		</Layout>
	</PrivateRoute>
	<PrivateRoute path="projects/:id/users/" let:location>
		<Layout>
			<h1 slot='header'>사용자</h1>     
			<UserList slot="body"/>
		</Layout>
	</PrivateRoute>
	<PrivateRoute path="projects/:id/issues/" let:location>
		<Layout>
			<h1 slot='header'>
				{#if $project }
					<span class='hidden sm:block'>{$project.name}</span>
					<span class='block sm:hidden'>{truncateString($project.name, 5)}</span>
				{:else}
					<div class="cp-text"></div>
				{/if}
			</h1>     
			<IssueList slot='body'/>
		</Layout>
	</PrivateRoute>
	<PrivateRoute path="projects/" let:location>
		<Layout>
			<h1 slot='header'>프로젝트</h1> 
			<ProjectList slot='body'/>
		</Layout>
	</PrivateRoute>

	<PrivateRoute path="profile/" let:location>
		<Layout>
			<h1 slot='header'>프로필</h1>     
			<Profile slot="body"/>
		</Layout>
	</PrivateRoute>	
	<Route path='/' component={Index} />
	<Route path='*'>
		<Notfound404 />
	</Route>
</Router>
</Notifications>

<style global>
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";
@import "./global.css";

@layer components{

	.btn-blue {
		@apply py-2 px-4 rounded-lg text-sm bg-blue-100 hover:bg-blue-200 focus:bg-blue-300 text-blue-600 hover:text-blue-800 border-none;
	}

	.btn-green {
		@apply py-2 px-4 rounded-lg text-sm bg-green-100 hover:bg-green-200 focus:bg-green-300 text-green-600 hover:text-green-800 border-none;
	}

	.btn-purple {
		@apply py-2 px-4 rounded-lg text-sm bg-purple-100 hover:bg-purple-200 focus:bg-purple-300 text-purple-600 hover:text-purple-800 border-none;
	}

	.btn-red{
		@apply rounded-lg px-4 py-2 text-sm bg-red-100 hover:bg-red-200 focus:bg-red-300 text-red-700;
	}

	.btn {
		@apply py-2 px-4 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 focus:bg-gray-300;
		@apply text-gray-500 hover:text-gray-600;/* transition duration-150; */
	}

	.btn.active {
		@apply bg-gray-200 font-semibold text-gray-700;	
	}

	input, .input{
		-webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-color: #fff;
    border-color: #6b7280;
    border-width: 1px;
    border-radius: 0px;
    padding-top: 0.5rem;
    padding-right: 0.75rem;
    padding-bottom: 0.5rem;
    padding-left: 0.75rem;
    font-size: 1rem;
    line-height: 1.5rem;
    --tw-shadow: 0 0 #0000;
	}
	
	.label{
		@apply text-xs px-2 py-1 rounded-md ;
	}

	.label-gray{
		@apply label bg-gray-100 text-gray-800;
	}

	.label-blue{
		@apply label bg-blue-100 text-blue-800;
	}

	.label-green{
		@apply label bg-green-100 text-green-800;
	}

	.blue-background-class{
		@apply bg-blue-100 ring-blue-500 ring-1;
		z-index: 500;
	}
	.sortable-chosen{
		@apply bg-white;
	}

	.page-nav :global(.option){
		@apply px-2 py-1 cursor-pointer text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:bg-gray-300 rounded-md mr-1 text-center;
		line-height: initial;
	}

	.page-nav :global(.option.active){
		@apply  bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700; 
	}

	.page-nav :global(.pagination-nav){
	}

  .sidebar-item.active{
		@apply text-gray-800 bg-gray-200 font-semibold hover:bg-gray-300;
	}
	
}
</style>