import { lazy } from 'react';

const DashboardPage = lazy(() => import('../pages/Dashboard/Dashboard'));
const KnowledgeBasePage = lazy(() => import('../pages/KnowledgeBase/KnowledgeBase'));
const PromptManagementPage = lazy(() => import('../pages/PromptManagement/PromptManagement'));
const MCInsightPage = lazy(() => import('../pages/Market&CompetitorInsight/MCInsight'));
const UploadPage = lazy(()=>import('../pages/UploadDocument/uploadpage'))
const SippPage = lazy(()=>import('../pages/SippCaseDetails/sippcasepage'))
const UserManagement = lazy(()=>import('../pages/UserManagament/usermanagement'))
const TeamManagementPage = lazy(()=>import('../pages/TeamManagement/TeamManagement'))
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
    title: 'Upload Document',
    path: '/upload-document',
    identifier: 'upload-document',
    icon: '/cloud.svg',
    component: UploadPage,

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
  {
    title: 'SIPP Case Details',
    path: '/sipp-case-details',
    identifier: 'sipp-case-details',
    icon: '/analysis.svg',
    component: SippPage,

  },
  {
    title: 'User Management',
    path: '/user-management',
    identifier: 'user-management',
    icon: '/user.svg',
    component: UserManagement,
  },
   {
    title: 'Team Management',
    path: '/team-management',
    identifier: 'team-management',
    icon: '/shield.svg', // Ganti dengan ikon yang sesuai
    component: TeamManagementPage,
    teams: ['superadmin'],
  },

];
