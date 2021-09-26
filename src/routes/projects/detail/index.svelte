<script>
import IssueRow from "./IssueRow.svelte";
import LayoutWithSidebar from "../../layoutWithSidebar.svelte";

const issues = []
</script>

<svelte:head>
  <title>이슈</title>
</svelte:head>
<LayoutWithSidebar>
  <section class='flex-auto'>
    <h1 class='text-2xl font-semibold mb-5'>프로젝트명</h1>
    <div class='border rounded-md shadow-sm bg-white'>
      <div class='py-4 px-4'>백로그</div>

      <div class='flex flex-col'>
        <IssueRow />
        <IssueRow />
        <IssueRow />
      </div>
      
    </div>
  </section>
</LayoutWithSidebar>