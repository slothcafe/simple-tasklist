// taskTemplates を定義（main.js から参照される）
const taskTemplates = [
  {
    name: '報告書作成',
    memo: '資料をまとめて報告書に記載',
    deadline: '',
    subtasks: [
      { name: '資料収集', memo: '', deadline: '' },
      { name: '構成案作成', memo: '', deadline: '' },
      { name: '執筆・提出', memo: '', deadline: '' }
    ]
  },
  {
    name: '会議準備',
    memo: '会議の議題と資料を整理',
    deadline: '',
    subtasks: [
      { name: '議題確認', memo: '', deadline: '' },
      { name: '資料印刷', memo: '', deadline: '' },
      { name: '会場予約', memo: '', deadline: '' }
    ]
  }
];
