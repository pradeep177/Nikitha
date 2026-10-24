import { createBrowserRouter } from 'react-router'
import PublicLayout from './PublicLayout'
import RouteError from './RouteError'
import LoadingState from '@/components/LoadingState'

/** Each chapter is code-split and loaded on demand. */
const page = (load) => async () => ({ Component: (await load()).default })

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: <RouteError />,
    hydrateFallbackElement: <LoadingState fullPage />,
    children: [
      { index: true, lazy: page(() => import('@/pages/HomePage')) },
      { path: 'memories', lazy: page(() => import('@/pages/MemoriesPage')) },
      { path: 'quiz', lazy: page(() => import('@/pages/QuizPage')) },
      { path: 'chats', lazy: page(() => import('@/pages/ChatsPage')) },
      { path: 'reasons', lazy: page(() => import('@/pages/LoveNotesPage')) },
      { path: 'timeline', lazy: page(() => import('@/pages/TimelinePage')) },
      { path: 'little-things', lazy: page(() => import('@/pages/LittleThingsPage')) },
      { path: 'soundtrack', lazy: page(() => import('@/pages/SoundtrackPage')) },
      { path: 'open-when', lazy: page(() => import('@/pages/OpenWhenPage')) },
      { path: 'surprise', lazy: page(() => import('@/pages/FinalSurprisePage')) },
      { path: '*', lazy: page(() => import('@/pages/NotFoundPage')) },
    ],
  },
  {
    path: '/admin',
    errorElement: <RouteError />,
    hydrateFallbackElement: <LoadingState fullPage message="Opening the admin room…" />,
    children: [
      { path: 'login', lazy: page(() => import('@/admin/AdminLoginPage')) },
      { path: 'reset-password', lazy: page(() => import('@/admin/ResetPasswordPage')) },
      {
        lazy: page(() => import('@/admin/ProtectedRoute')),
        children: [
          {
            lazy: page(() => import('@/admin/AdminLayout')),
            children: [
              { index: true, lazy: page(() => import('@/admin/AdminDashboard')) },
              { path: 'landing', lazy: page(() => import('@/admin/managers/LandingManager')) },
              { path: 'messages', lazy: page(() => import('@/admin/managers/MessagesManager')) },
              { path: 'flirty', lazy: page(() => import('@/admin/managers/FlirtyLinesManager')) },
              { path: 'memories', lazy: page(() => import('@/admin/managers/MemoriesManager')) },
              { path: 'quiz', lazy: page(() => import('@/admin/managers/QuizManager')) },
              { path: 'chats', lazy: page(() => import('@/admin/managers/ChatsManager')) },
              { path: 'reasons', lazy: page(() => import('@/admin/managers/LoveNotesManager')) },
              { path: 'timeline', lazy: page(() => import('@/admin/managers/TimelineManager')) },
              { path: 'moods', lazy: page(() => import('@/admin/managers/MoodsManager')) },
              { path: 'soundtrack', lazy: page(() => import('@/admin/managers/SoundtrackManager')) },
              { path: 'letters', lazy: page(() => import('@/admin/managers/LettersManager')) },
              { path: 'surprise', lazy: page(() => import('@/admin/managers/SurpriseManager')) },
              { path: 'quiz-results', lazy: page(() => import('@/admin/managers/QuizResultsPage')) },
              { path: 'settings', lazy: page(() => import('@/admin/managers/SettingsManager')) },
              { path: '*', lazy: page(() => import('@/pages/NotFoundPage')) },
            ],
          },
        ],
      },
    ],
  },
])
