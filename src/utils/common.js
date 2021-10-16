export const issueStatus = [
  {value:0, label: "해야 할 일", btnClass: 'btn'}, 
  {value:1, label: "진행 중", btnClass: 'btn-blue'},
  {value:2, label: "완료됨", btnClass: 'btn-green'},
  {value:3, label: "보류", btnClass: 'btn-purple'}
];


export const READONLY_NOTI = {
  text:"읽기전용 사용자입니다.",
  type:"danger"
}

export function stripTags(htmlStr){
  const dom = new DOMParser().parseFromString(htmlStr, 'text/html');
  const txt = dom.body.textContent;
  return txt
}
