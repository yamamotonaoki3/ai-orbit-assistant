export const MENUS = [
  { id: 'profile', label: 'プロフィール設定', icon: '◉', description: 'あなたの基本情報や利用設定' },
  { id: 'notifications', label: '通知設定', icon: '♧', description: 'お知らせとリマインド' },
  { id: 'tasks', label: 'タスク一覧', icon: '☑', description: '今日のタスクと推奨ToDo' },
  { id: 'security', label: 'セキュリティ', icon: '◇', description: 'アカウントを安全に保つ' },
  { id: 'analytics', label: '分析', icon: '▥', description: '操作状況のサンプル分析' },
] as const;

export type MenuId = (typeof MENUS)[number]['id'];

export type AppSettings = {
  displayName: string;
  bio: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  reminders: boolean;
  twoFactor: boolean;
  firstTaskDone: boolean;
};

export const INITIAL_SETTINGS: AppSettings = {
  displayName: '',
  bio: 'AIアシスタントと一緒に、毎日のタスクを整理しましょう。',
  emailNotifications: true,
  pushNotifications: true,
  reminders: true,
  twoFactor: false,
  firstTaskDone: false,
};

export type Recommendation = {
  text: string;
  title: string;
  target: MenuId;
};

export function recommend(settings: AppSettings): Recommendation {
  if (!settings.displayName.trim()) {
    return { title: 'プロフィールを入力', text: '通知の準備ができていますね！ 次はプロフィールを入力しましょう。', target: 'profile' };
  }
  if (!settings.twoFactor) {
    return { title: '2段階認証を確認', text: `${settings.displayName}さん、次はセキュリティ設定を確認するのがおすすめです。`, target: 'security' };
  }
  if (!settings.firstTaskDone) {
    return { title: '最初のタスクを登録', text: '基本設定が整いました！ 次は最初のタスクを登録しましょう。', target: 'tasks' };
  }
  return { title: '設定が完了', text: 'お疲れさまです！ 基本設定が完了しました。今日も一緒に進めましょう。', target: 'tasks' };
}

export function progress(settings: AppSettings): number {
  const checks = [
    Boolean(settings.displayName.trim()),
    settings.emailNotifications || settings.pushNotifications,
    settings.twoFactor,
    settings.firstTaskDone,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}