import { lazy } from 'react';

const DashboardPage = lazy(() => import('../pages/Dashboard/Dashboard'));
const KnowledgeBasePage = lazy(() => import('../pages/KnowledgeBase/KnowledgeBase'));
const PromptManagementPage = lazy(() => import('../pages/PromptManagement/PromptManagement'));
const MCInsightPage = lazy(() => import('../pages/Market&CompetitorInsight/MCInsight'));

export const menu = [
  {
    title: 'Dashboard',
    path: '/',
    identifier: 'dashboard',
    icon: '/dashboard-icon.svg',
    component: DashboardPage,
  },
  {
    title: 'Knowledge Base',
    path: '/knowledge-base',
    identifier: 'knowledge-base',
    icon: '/upload-document.svg',
    component: KnowledgeBasePage,
  },
  {
    title: 'Prompt Management',
    path: '/prompt-management',
    identifier: 'prompt-management',
    icon: '/prompt-management.svg',
    component: PromptManagementPage,
  },
  {
    title: 'Market & Competitor Insight',
    path: '/market-competitor-insight',
    identifier: 'market-competitor-insight',
    icon: '/comparison.svg',
    component: MCInsightPage,
  },
];
