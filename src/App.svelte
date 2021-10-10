<script>
import './utils/dropdown';
import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import relativeTime from 'dayjs/plugin/relativeTime';
import { Router, Route } from 'svelte-navigator';
import PrivateRoute from './components/PrivateRoute/PrivateRoute.svelte';
import Index from './routes/index.svelte';
import Layout from "./routes/layout.svelte";
import Login from './routes/login.svelte';
import User from './routes/user.svelte';
import ProjectList from './routes/projects/ProjectList.svelte';
import IssueList from './routes/projects/issues/IssueList.svelte';
import Example from './routes/example.svelte';
import IssueDetail from './routes/projects/issues/IssueDetail.svelte';
import UserList from './routes/projects/UserList.svelte';
import api from './utils/api';
import ProjectSettings from './routes/ProjectSettings.svelte';
import { project } from './store';
dayjs.locale('ko')
dayjs.extend(relativeTime)

api.defaults.baseURL = BASE_URL
</script>
	
<svelte:head>
	<script src="https://cdn.tiny.cloud/1/hc0aj9chontfnpqrhoue1ms95l96pb9tcm1uroo8447dr9ek/tinymce/5/tinymce.min.js" referrerpolicy="origin" ></script>
</svelte:head>

<Router>

	<Route path='/login'>
		<Login />
	</Route>
	<Route path='/example' component={Example} />
	<PrivateRoute path="projects/:project_id/issues/:issue_id" let:location>
		<h1 slot='header'>디테일</h1> 
		<IssueDetail slot='body'/>
	</PrivateRoute>
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
					{$project.name}
				{:else}
					<div class="cp-text"></div>
				{/if}
			</h1>     
			<IssueList slot='body'/>
		</Layout>
	</PrivateRoute>
	<PrivateRoute path="projects" let:location>
		<Layout>
			<h1 slot='header'>프로젝트</h1> 
			<ProjectList slot='body'/>
		</Layout>
	</PrivateRoute>

	<Route path='/user' component={User} />
	<Route path='/' component={Index} />
	<!-- </Layout> -->
</Router>

<style global>
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";
@import "./global.css";

</style>