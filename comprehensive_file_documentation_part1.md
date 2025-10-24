# ДОКУМЕНТАЦИЯ НА ФАЙЛОВЕТЕ В ПРОЕКТА PAWFECMATCH

## ЧАСТ 1: УЕБ ПРИЛОЖЕНИЕ (apps/web/src/)

### ГЛАВНА СТРУКТУРА НА ДИРЕКТОРИИТЕ

#### `/app/` - Next.js App Router директория

Съдържа страниците и лейаутите на Next.js приложението с app router
архитектурата.

**Основни файлове:**

- `layout.tsx` (2.9 KB) - Главен лейаут компонент който обвива цялото приложение
- `page.tsx` (1.1 KB) - Начална страница на приложението
- `loading.tsx` (267 bytes) - Компонент за зареждане
- `not-found.tsx.disabled` (0 bytes) - Деактивирана страница за 404 грешки
- `globals.css` (40.1 KB) - Глобални CSS стилове за приложението
- `providers.tsx` (2.2 KB) - Провайдъри за контекст и state management

**Поддиректории:**

- `(auth)/` - Аутентификационни страници (login, register, forgot password)
- `(admin)/` - Административен панел с различни секции (analytics, moderation,
  settings)
- `(protected)/` - Защитени страници за логнати потребители (dashboard, chat,
  matches)
- `api/` - API routes за сървър-side логика
- `admin/` - Допълнителни административни страници
- `browse/` - Страница за разглеждане на профили
- `button-showcase/` - Демо страница за бутони
- `dev/` - Развойни инструменти и тестови страници
- `lib/` - Помощни библиотеки и utility функции
- `subscription/` - Страница за управление на абонаменти

#### `/components/` - React компоненти (199 елемента)

Най-голямата директория с всички UI компоненти на приложението.

**Основни категории компоненти:**

**Аутентификационни компоненти (`/Auth/`):**

- `BiometricAuth.tsx` (3.2 KB) - Биометрична аутентификация
- `TwoFactorAuth.tsx` (4.1 KB) - Двуфакторна аутентификация

**Административни компоненти (`/admin/`):**

- `AnalyticsVisualization.tsx` (8.9 KB) - Визуализация на аналитични данни
- `ReportsManagement.tsx` (6.7 KB) - Управление на отчети
- `SecurityAlertsDashboard.tsx` (7.3 KB) - Dashboard за сигурност
- `UIEnhancements.tsx` (5.2 KB) - UI подобрения
- `AccessibilityUtils.tsx.bak` (3.1 KB) - Архивиран файл за accessibility
  utilities
- `XA.md` (1.2 KB) - Документация

**AI компоненти (`/AI/`):**

- `AIBioAssistant.tsx` (4.8 KB) - AI асистент за биографии
- `BioGenerator.tsx` (3.9 KB) - Генератор на биографии с AI
- `CompatibilityAnalyzer.tsx` (5.2 KB) - Анализатор за съвместимост
- `PhotoAnalyzer.tsx` (4.1 KB) - Анализатор на снимки с AI

**Анимационни компоненти (`/Animations/`):**

- `MicroInteractions.tsx` (2.9 KB) - Микро взаимодействия
- `PageTransition.tsx` (3.1 KB) - Преходи между страници

**Чат компоненти (`/Chat/`):**

- `ChatHeader.tsx` (2.8 KB) - Хедър на чат
- `MessageBubble.tsx` (4.2 KB) - Балонче за съобщения
- `MessageInput.tsx` (3.9 KB) - Input за съобщения
- `MessageList.tsx` (5.1 KB) - Списък със съобщения
- `TypingIndicator.tsx` (2.1 KB) - Индикатор за писане
- `VoiceRecorder.tsx` (3.7 KB) - Записвач на глас
- `FileShare.tsx` (2.9 KB) - Споделяне на файлове
- `GifPicker.tsx` (3.1 KB) - Избор на GIF изображения
- `StickerPicker.tsx` (2.8 KB) - Избор на стикери
- `MessageReactions.tsx` (2.3 KB) - Реакции на съобщения
- `SimpleMessageList.tsx` (3.2 KB) - Опростен списък съобщения
- `VirtualizedMessageList.tsx` (4.8 KB) - Виртуализиран списък за
  производителност

**Комуникационни компоненти (`/Community/`):**

- `CommunityFeed.tsx` (6.1 KB) - Комунитетен фийд
- `EnhancedCommunityFeed.tsx` (7.2 KB) - Подобрен комунитетен фийд
- `AICommunitySuggestions.tsx` (3.8 KB) - AI предложения за общността
- `PackGroupsManager.tsx` (4.9 KB) - Мениджър на групите

**Геймификационни компоненти (`/Gamification/`):**

- `AchievementBadges.tsx` (3.2 KB) - Значки за постижения
- `DailyStreak.tsx` (2.8 KB) - Ежедневни серии
- `Leaderboard.tsx` (4.1 KB) - Класация

**Лейаут компоненти (`/Layout/`):**

- `Header.tsx` (5.9 KB) - Главен хедър
- `PremiumLayout.tsx` (3.7 KB) - Премиум лейаут
- `ProtectedLayout.tsx` (4.2 KB) - Защитен лейаут

**Локационни компоненти (`/Location/`):**

- `LocationPrivacy.tsx` (3.1 KB) - Поверителност на локацията
- `NearbyEvents.tsx` (2.9 KB) - Близки събития
- `TravelMode.tsx` (2.5 KB) - Режим на пътуване

**Карта компоненти (`/Map/`):**

- `MapView.tsx` (6.8 KB) - Изглед на карта
- `AIMapFeatures.tsx` (4.7 KB) - AI функции за карта
- `PlaygroundMap.tsx` (3.9 KB) - Тестова карта

**Памет компоненти (`/MemoryWeave/`):**

- `MemoryWeave.tsx` (7.1 KB) - Основен компонент за спомени
- `ConversationTimeline.tsx` (4.2 KB) - Времева линия на разговори
- `MemoryWeave3D.tsx` (5.8 KB) - 3D визуализация на спомени

**Модерационни компоненти (`/moderation/`):**

- `BlockMuteMenu.tsx` (2.9 KB) - Меню за блокиране и заглушаване
- `RejectModal.tsx` (3.1 KB) - Модал за отхвърляне
- `EnhancedRejectModal.tsx` (4.2 KB) - Подобрен модал за отхвърляне
- `ReportDialog.tsx` (3.8 KB) - Диалог за докладване
- `KeyboardShortcutsLegend.tsx` (2.3 KB) - Легенда за клавишни комбинации

**Известия компоненти (`/Notifications/`):**

- `SmartNotifications.tsx` (4.9 KB) - Интелигентни известия

**Производителност компоненти (`/Performance/`):**

- `CodeSplitter.tsx` (2.8 KB) - Code splitting компонент
- `LazyImage.tsx` (3.1 KB) - Лениво зареждане на изображения
- `VirtualScroll.tsx` (4.2 KB) - Виртуален скрол

**Личност компоненти (`/Personality/`):**

- `CompatibilityMatrix.tsx` (5.1 KB) - Матрица за съвместимост
- `PersonalityCard.tsx` (3.7 KB) - Карта за личност

**Любимци компоненти (`/Pet/`):**

- `SwipeCard.tsx` (6.8 KB) - Карта за плъзгане
- `OptimizedSwipeCard.tsx` (5.9 KB) - Оптимизирана карта за плъзгане
- `SwipeStack.tsx` (4.7 KB) - Стек от карти за плъзгане
- `SwipeStackSkeleton.tsx` (2.9 KB) - Скелетон за стек
- `MatchModal.tsx` (4.1 KB) - Модал за мач

**Премиум компоненти (`/Premium/`):**

- `SubscriptionManager.tsx` (7.9 KB) - Мениджър на абонаменти

**Поверителност компоненти (`/Privacy/`):**

- `PrivacyControls.tsx` (3.8 KB) - Контроли за поверителност

**Профил компоненти (`/Profile/`):**

- `PetProfileEditor.tsx` (5.2 KB) - Редактор на профил на любимец

**Провайдър компоненти (`/providers/`):**

- `AuthProvider.tsx` (4.8 KB) - Провайдър за аутентификация
- `AppErrorBoundary.tsx` (3.9 KB) - Error boundary за приложението

**PWA компоненти (`/PWA/`):**

- `InstallPrompt.tsx` (2.9 KB) - Prompt за инсталация
- `PWAInitializer.tsx` (3.1 KB) - Инициализатор за PWA

**Напомняния компоненти (`/Reminders/`):**

- `PetCareReminders.tsx` (4.2 KB) - Напомняния за грижа за любимци

**Видео разговори (`/VideoCall/`):**

- `VideoCallRoom.tsx` (8.1 KB) - Стаята за видео разговори

**Допълнителни компоненти:**

- `ErrorBoundary.tsx` (3.2 KB) - Error boundary компонент
- `ThemeToggle.tsx` (2.1 KB) - Toggle за тема
- `DevTools.tsx` (4.7 KB) - Развойни инструменти
- `ButtonShowcase2025.tsx` (6.9 KB) - Демо на бутони 2025
- `HydrationBoundary.tsx` (2.8 KB) - Boundary за hydration
- `EnhancedSwipeCard.tsx` (5.1 KB) - Подобрена swipe карта
- `AnimatedButton.tsx` (3.2 KB) - Анимиран бутон
- `Footer.tsx` (2.9 KB) - Футър
- `OptimizedImage.tsx` (3.1 KB) - Оптимизирано изображение
- `PhotoUploadComponent.tsx` (4.8 KB) - Компонент за качване на снимки
- `PremiumSplashScreen.tsx` (3.9 KB) - Премиум splash екран
- `ShimmerPlaceholder.tsx` (2.3 KB) - Shimmer placeholder
- `SwipeCard.tsx` (6.2 KB) - Swipe карта
- `SwipeFilters.tsx` (3.7 KB) - Филтри за swipe

#### `/hooks/` - React хукове (48 елемента)

Персонализирани React хукове за различни функционалности на приложението.

**Основни категории хукове:**

**API хукове (`api-hooks.tsx`):**

- `useApiQuery` - За извличане на данни от API
- `useApiMutation` - За модифициране на данни през API
- `useApiInfiniteQuery` - За пагинирани данни

**Аутентификационни хукове:**

- `useAuth.ts` (4.9 KB) - Управление на аутентификацията на потребителя
- `useAuthForms.ts` (3.1 KB) - Форми за вход и регистрация
- `useBiometric.ts` (2.8 KB) - Биометрична аутентификация
- `useOptimizedAuth.ts` (4.2 KB) - Оптимизирана аутентификация

**Чат хукове:**

- `useChat.ts` (5.1 KB) - Управление на чат функционалност
- `useOptimizedChat.ts` (4.8 KB) - Оптимизиран чат

**Анимационни хукове:**

- `useBounceAnimation.ts` (2.3 KB) - Bounce анимация
- `useCallPulseAnimation.ts` (3.1 KB) - Пулсираща анимация за разговори
- `useFadeInAnimation.ts` (2.1 KB) - Fade-in анимация
- `useFloatingAnimation.ts` (2.7 KB) - Плаваща анимация
- `useLiquidAnimation.ts` (3.2 KB) - Течна анимация
- `useMagneticAnimation.ts` (2.9 KB) - Магнитна анимация
- `useMorphAnimation.ts` (3.1 KB) - Морфинг анимация
- `usePulseAnimation.ts` (2.5 KB) - Пулсираща анимация
- `useSequenceAnimation.ts` (3.8 KB) - Секвенционални анимации
- `useSlideInAnimation.ts` (2.3 KB) - Slide-in анимация
- `useSpringAnimation.ts` (3.2 KB) - Spring анимация
- `useToastAnimation.ts` (2.7 KB) - Toast анимации

**UI и взаимодействие хукове:**

- `useAccessibility.ts` (3.1 KB) - Достъпност функции
- `useAccessibilityHooks.ts` (4.2 KB) - Допълнителни accessibility хукове
- `useConfetti.ts` (2.1 KB) - Конфети ефект
- `useErrorDisplay.ts` (2.9 KB) - Показване на грешки
- `useFocusManagement.ts` (3.1 KB) - Управление на фокуса
- `useFocusTrap.ts` (2.8 KB) - Focus trap
- `useFormValidation.ts` (4.1 KB) - Валидация на форми
- `useHapticFeedback.ts` (3.2 KB) - Haptic feedback
- `useKeyboardShortcuts.ts` (4.7 KB) - Клавишни комбинации
- `useMediaQuery.ts` (2.3 KB) - Media queries
- `useThemeToggle.ts` (2.1 KB) - Toggle на тема

**Известия и комуникация:**

- `useNotifications.ts` (3.8 KB) - Push известия
- `useSocket.ts` (4.9 KB) - WebSocket връзка
- `useEnhancedSocket.ts` (5.2 KB) - Подобрена socket връзка

**Производителност и оптимизация:**

- `usePerformance.ts` (3.1 KB) - Мониторинг на производителност
- `useOffline.ts` (3.7 KB) - Офлайн функционалност

**Swipe и мачове:**

- `useSwipe.ts` (4.2 KB) - Swipe функционалност
- `useSwipeRateLimit.ts` (2.9 KB) - Ограничаване на swipe скорост
- `useOptimizedSwipe.ts` (4.1 KB) - Оптимизиран swipe

**Профил и данни:**

- `useAccountOperations.ts` (3.9 KB) - Операции със сметката
- `useProfileData.ts` (3.7 KB) - Данни за профила
- `useSettings.ts` (3.2 KB) - Настройки

**AI и анализ:**

- `useBiometricAnalyzer.ts` (3.8 KB) - Биометричен анализатор
- `useEmotionDetector.ts` (2.9 KB) - Детектор на емоции
- `useNeuralNetwork.ts` (4.1 KB) - Невронна мрежа

**Специфични функционалности:**

- `useAdoptionContract.ts` (4.2 KB) - Договори за осиновяване
- `useARAnimation.ts` (3.1 KB) - AR анимации
- `useARHaptic.ts` (2.8 KB) - AR haptic feedback
- `useDeepLink.ts` (3.9 KB) - Deep linking
- `useErrorRecovery.ts` (3.2 KB) - Възстановяване от грешки
- `useFavorites.ts` (3.8 KB) - Любими профили
- `useFeedbackStates.ts` (2.9 KB) - Състояния на feedback
- `useGeofencingService.ts` (3.7 KB) - Геофенсинг услуга
- `useLeaderboard.ts` (3.1 KB) - Класация
- `useMemories.ts` (4.1 KB) - Спомени
- `useMemoryWeaveAnimation.ts` (3.8 KB) - Анимации за спомени
- `usePhotoAnimation.ts` (2.9 KB) - Анимации на снимки
- `usePhotoUpload.ts` (4.1 KB) - Качване на снимки
- `usePremiumHapticFeedback.ts` (3.2 KB) - Премиум haptic feedback
- `useParallaxScroll.ts` (2.7 KB) - Parallax скрол
- `usePredictiveTyping.ts` (3.1 KB) - Предиктивно писане
- `useReactQuery.ts` - React Query интеграция
- `useRetry.ts` (2.8 KB) - Retry логика
- `useVideoCall.ts` (4.7 KB) - Видео разговори

#### `/services/` - Услуги и API клиенти (32 елемента)

Услуги за комуникация с backend API, външни услуги и бизнес логика.

**Основни категории услуги:**

**API услуги:**

- `api.ts` (8.1 KB) - Основен API клиент за комуникация с backend
- `apiClient.ts` (6.9 KB) - Разширен API клиент с допълнителни функции
- `api.subscription.ts` (3.2 KB) - API за абонаменти

**Аутентификационни услуги:**

- `AuthService.ts` (5.1 KB) - Управление на аутентификация
- `BiometricService.ts` (3.8 KB) - Биометрични услуги

**Чат и комуникация:**

- `chat/` - Директория с чат услуги
  - `ChatAnimationManager.ts` (4.1 KB) - Мениджър на чат анимации
  - `ChatSocketManager.ts` (5.2 KB) - Мениджър на чат сокети
  - `ImageManager.ts` (3.7 KB) - Управление на изображения в чата
  - `MessageManager.ts` (4.8 KB) - Мениджър на съобщения
  - `SafetyManager.ts` (3.1 KB) - Мениджър за безопасност на чата
  - `TypingManager.ts` (2.9 KB) - Мениджър за индикатори на писане
  - `index.ts` (2.1 KB) - Експорти от чат модула

**WebRTC и видео разговори:**

- `webrtc/` - Директория с WebRTC услуги
  - `CallStateManager.ts` (4.7 KB) - Мениджър на състоянията на разговори
  - `MediaManager.ts` (5.1 KB) - Мениджър на медия потоци
  - `PeerConnectionManager.ts` (6.2 KB) - Мениджър на peer connections
  - `QualityMonitor.ts` (3.8 KB) - Монитор на качеството
  - `SignalingManager.ts` (4.9 KB) - Мениджър на сигнализация
  - `index.ts` (2.3 KB) - Експорти от WebRTC модула
- `WebRTCService.ts` (12.1 KB) - Основна WebRTC услуга
- `WebRTCServiceNew.ts` (14.2 KB) - Нова версия на WebRTC услугата

**Известия:**

- `notifications.ts` (4.2 KB) - Push известия
- `pushNotificationService.ts` (3.9 KB) - Push notification услуга

**Премиум и плащания:**

- `PremiumService.ts` (4.7 KB) - Премиум услуги
- `subscriptionAPI.test.ts` - Тестове за subscription API

**AI и анализ:**

- `PersonalityService.ts` (5.8 KB) - Услуга за анализ на личността

**Сигурност и криптиране:**

- `SecureAPIService.ts` (4.1 KB) - Сигурна API услуга

**Административни услуги:**

- `adminAPI.ts` (6.9 KB) - Административен API

**Обработка на изображения:**

- `ImageCompressionService.ts` (4.2 KB) - Компресия на изображения

**Класации и геймификация:**

- `LeaderboardService.ts` (3.7 KB) - Услуга за класации

**Локации и карти:**

- `LocationService.ts` (4.1 KB) - Локационни услуги

**Модерация:**

- `automatedModeration.js` (5.2 KB) - Автоматизирана модерация

**Аналитика и проследяване:**

- `AnalyticsService.ts` (6.8 KB) - Аналитични услуги
- `usageTracking.ts` (4.9 KB) - Проследяване на използването

**Обработка на грешки:**

- `errorHandler.ts` (5.1 KB) - Централизирана обработка на грешки
- `logger.ts` (3.7 KB) - Логър услуга

**Истории и сторис:**

- `stories/` - Директория с услуги за истории
  - `index.ts` (2.1 KB) - Експорти от stories модула
  - `useEnhancedStoryGestures.ts` (3.9 KB) - Подобрени жестове за истории
  - `useStoryData.ts` (3.1 KB) - Данни за истории
  - `useStoryGestures.ts` (2.8 KB) - Жестове за истории
  - `useStoryNavigation.ts` (2.9 KB) - Навигация в истории
  - `useStorySocket.ts` (3.2 KB) - Socket връзка за истории
  - `useStoryTimer.ts` (2.1 KB) - Таймер за истории
  - `useStoryViewerState.ts` (3.7 KB) - Състояние на viewer за истории

**Мачове и съвпадения:**

- `MatchingService.ts` (5.7 KB) - Услуга за мачове

**Офлайн функционалност:**

- `offlineService.ts` (4.8 KB) - Офлайн услуги
- `OfflineSyncService.ts` (6.1 KB) - Синхронизация при офлайн

**Външни услуги:**

- `emailService.js` (3.9 KB) - Имейл услуги
- `cloudinaryService.js` (2.8 KB) - Cloudinary за изображения
- `emailTemplates.js` (4.1 KB) - Имейл шаблони

**Мониторинг:**

- `monitoring.js` (4.2 KB) - Мониторинг на системата

**Stripe интеграция:**

- `paymentRetryService.js` (3.1 KB) - Повторни опити за плащания
- `stripeService.js` (5.8 KB) - Stripe интеграция

**WebSocket комуникация:**

- `chatService.js` (6.7 KB) - Чат услуга
- `chatSocket.js` (4.9 KB) - Чат сокети

**Други:**

- `AssetPreloader.ts` (3.2 KB) - Предварително зареждане на ресурси
- `DeepLinkService.ts` (3.8 KB) - Deep linking услуга
- `feedbackService.ts` (2.9 KB) - Услуга за feedback
- `fileUpload.ts` (4.1 KB) - Качване на файлове
- `GeofencingService.ts` (4.7 KB) - Геофенсинг
- `subscriptionAnalyticsService.js` (3.9 KB) - Аналитика за абонаменти
- `usageTrackingService.js` (4.2 KB) - Проследяване на използването

#### `/types/` - TypeScript типове и интерфейси (11 елемента)

TypeScript дефиниции за типова безопасност.

**Основни типове:**

- `index.ts` (8.1 KB) - Основни експорти на типове
- `pet-types.ts` (4.2 KB) - Типове за любимци
- `react-types.ts` (3.1 KB) - React специфични типове
- `account.ts` (2.9 KB) - Типове за акаунти
- `advanced.ts` (5.7 KB) - Разширени типове
- `animations.ts` (3.8 KB) - Типове за анимации
- `api-responses.ts` (6.1 KB) - API отговор типове
- `api.ts` (4.7 KB) - API типове
- `bulk-fix-types.ts` (2.1 KB) - Типове за масови корекции
- `haptics.ts` (1.9 KB) - Haptic feedback типове
- `models.ts` (7.2 KB) - Модел типове
- `moderation.ts` (3.1 KB) - Модерация типове
- `realtime.ts` (2.8 KB) - Real-time типове
- `socket.ts` (3.2 KB) - Socket типове
- `story.ts` (2.1 KB) - Story типове
- `swipe.ts` (3.7 KB) - Swipe типове

#### `/constants/` - Константи и конфигурации (3 елемента)

Статични стойности и конфигурации.

**Константи файлове:**

- `call.ts` (2.1 KB) - Константи за разговори
- `design-tokens.ts` (8.9 KB) - Design tokens
- `enhancedSwipeCard.ts` (1.9 KB) - Swipe card константи
- `haptics.ts` (2.3 KB) - Haptic константи
- `photo.ts` (1.8 KB) - Фото константи
- `premiumUi.ts` (3.1 KB) - Премиум UI константи
- `swipeCard.ts` (2.7 KB) - Swipe card константи

#### `/contexts/` - React контексти (6 елемента)

Глобални контексти за state management.

**Контекст файлове:**

- `AccessibilityContext.tsx` (3.2 KB) - Контекст за достъпност
- `AnalyticsContext.tsx` (4.1 KB) - Аналитичен контекст
- `AuthContext.tsx` (5.7 KB) - Аутентификационен контекст
- `MotionContext.tsx` (2.8 KB) - Motion контекст
- `SocketContext.tsx` (4.2 KB) - Socket контекст
- `ThemeContext.tsx` (3.9 KB) - Темов контекст

#### `/lib/` - Помощни библиотеки (16 елемента)

Utility функции и помощни модули.

**Библиотечни файлове:**

- `index.ts` (2.1 KB) - Основни експорти
- `analytics-service.ts` (4.8 KB) - Аналитична услуга
- `api-client.ts` (6.1 KB) - API клиент
- `auth-store.ts` (4.2 KB) - Auth store
- `auth.ts` (5.1 KB) - Аутентификация
- `db.ts` (3.9 KB) - База данни
- `ErrorHandler.ts` (4.7 KB) - Обработка на грешки
- `http.ts` (3.2 KB) - HTTP utility
- `premium-tier-service.ts` (3.8 KB) - Премиум tier услуга
- `sentry.ts` (4.1 KB) - Sentry интеграция
- `toast.ts` (2.9 KB) - Toast notifications
- `utils.ts` (7.2 KB) - Общи utility функции
- `video-communication.ts` (5.1 KB) - Видео комуникация

#### `/store/` и `/stores/` - State management

Zustand stores за глобално състояние.

**Store файлове:**

- `filterStore.ts` (3.1 KB) - Филтри store
- `auth-store.ts` (4.9 KB) - Аутентификационен store
- `index.ts` (2.1 KB) - Експорти
- `settingsStore.ts` (2.8 KB) - Настройки store
- `theme.ts` (3.2 KB) - Тема store
- `useAnalyticsStore.ts` (3.7 KB) - Аналитичен store
- `useAuthStore.ts` (4.1 KB) - Auth store hook
- `useMatchStore.ts` (3.2 KB) - Match store
- `usePreferencesStore.ts` (2.9 KB) - Preferences store
- `useUIStore.ts` (3.8 KB) - UI store

#### `/styles/` - CSS стилове

Стилове и теми.

#### `/tests/` - Тестови файлове

Тестови помощни функции.

#### `/utils/` - Utility функции (23 елемента)

Различни помощни функции.

**Utility категории:**

- `http/` - HTTP utilities
- `analytics-system.ts` (4.1 KB) - Аналитична система
- `codeSplitting.tsx` (2.8 KB) - Code splitting
- `cookies.ts` (2.1 KB) - Cookies управление
- `crypto.ts` (3.7 KB) - Криптиране
- `error-boundary.tsx` (3.2 KB) - Error boundary
- `export.ts` (2.9 KB) - Експорт функции
- `image-optimization.ts` (4.1 KB) - Оптимизация на изображения
- `imageOptimization.tsx` (3.9 KB) - Image optimization React
- `inputValidation.ts` (3.2 KB) - Валидация на input
- `jwt-validator.ts` (2.8 KB) - JWT валидация
- `performance-optimizations.ts` (5.1 KB) - Performance оптимизации
- `performance.ts` (4.7 KB) - Performance utilities
- `pwa.ts` (3.1 KB) - PWA функции
- `rate-limiter.ts` (2.9 KB) - Rate limiting
- `UI_UX_AUDIT_REPORT.md` (1.2 KB) - UI/UX одит доклад
- `webVitals.ts` (3.1 KB) - Web vitals

#### `/middleware.ts` - Middleware

Middleware конфигурация (3 KB)

#### `/setupTests.js` - Test setup

Настройка за тестове (4.8 KB)

#### `/index.tsx` - Entry point

Основна entry точка на приложението (268 bytes)

#### `/global.d.ts` - Global types

Глобални TypeScript дефиниции (457 bytes)

# ДОКУМЕНТАЦИЯ НА ФАЙЛОВЕТЕ В ПРОЕКТА PAWFECMATCH

## ЧАСТ 2: МОБИЛНО ПРИЛОЖЕНИЕ (apps/mobile/src/)

### ГЛАВНА СТРУКТУРА НА ДИРЕКТОРИИТЕ

#### `/components/` - React Native компоненти (100 елемента)

UI компоненти за мобилното приложение, адаптирани за React Native и Expo.

**Основни категории компоненти:**

**Premium компоненти (`/Premium/`):** Тези компоненти предоставят премиум
потребителско изживяване с модерни UI елементи.

- `EnhancedGlassmorphism.tsx` (4.2 KB) - Подобрен glassmorphism ефект
- `FAB.tsx` (3.1 KB) - Floating Action Button с анимации
- `FloatingToast.tsx` (2.9 KB) - Плаващи toast известия
- `GlassCard.tsx` (3.8 KB) - Стъклена карта с blur ефект
- `GlassmorphicComponents.tsx` (5.7 KB) - Комплект glassmorphic компоненти
- `Glassmorphism.tsx` (6.1 KB) - Основен glassmorphism компонент
- `GradientButton.tsx` (4.1 KB) - Градиентен бутон
- `index.ts` (2.1 KB) - Експорти от Premium модула
- `LiquidFAB.tsx` (3.9 KB) - Течен FAB с fluid анимации
- `MagneticGlassCard.tsx` (4.2 KB) - Магнитна стъклена карта
- `MicroButton.tsx` (2.8 KB) - Микро бутон с haptic feedback
- `MorphingGradientButton.tsx` (4.7 KB) - Морфиращ градиентен бутон
- `PremiumButton.tsx` (5.1 KB) - Премиум бутон компонент
- `PremiumCard.tsx` (3.9 KB) - Премиум карта
- `PremiumGate.tsx` (4.1 KB) - Gate за премиум функции
- `Toast.tsx` (3.2 KB) - Toast компонент

**Аутентификационни компоненти (`/auth/`):**

- `BiometricSetup.tsx` (3.7 KB) - Настройка на биометрична аутентификация

**Чат компоненти (`/chat/`):**

- `index.ts` (2.1 KB) - Експорти
- `MessageBubble.tsx` (4.8 KB) - Балонче за съобщения
- `MessageInput.tsx` (3.9 KB) - Input за писане на съобщения
- `MessageList.tsx` (5.1 KB) - Списък със съобщения
- `MobileChat.tsx` (7.2 KB) - Основен мобилен чат компонент
- `MobileVoiceRecorder.tsx` (4.1 KB) - Гласов рекордер за мобилни устройства
- `TypingIndicator.tsx` (2.3 KB) - Индикатор за писане

**Викане (Calling) компоненти (`/calling/`):**

- `CallManager.tsx` (8.1 KB) - Мениджър на разговори

**Филтри компоненти (`/filters/`):**

- `AdvancedPetFilters.tsx` (6.7 KB) - Разширени филтри за търсене на любимци

**Мачове компоненти (`/matches/`):**

- `EmptyState.tsx` (2.9 KB) - Празно състояние за мачове
- `ErrorState.tsx` (3.1 KB) - Грешка състояние за мачове
- `MatchCard.tsx` (4.7 KB) - Карта за мач

**Спомени компоненти (`/memories/`):**

- `ConnectionPath.tsx` (3.8 KB) - Път на връзка в спомените
- `MemoryCard.tsx` (4.1 KB) - Карта за спомен

**Профил компоненти (`/profile/`):**

- `PremiumSection.tsx` (3.2 KB) - Премиум секция в профила
- `ProfileHeader.tsx` (4.1 KB) - Хедър на профила
- `ProfileStats.tsx` (2.9 KB) - Статистики на профила

**Преки действия компоненти (`/shortcuts/`):**

- `QuickActions.tsx` (3.1 KB) - Бързи действия
- `SiriShortcuts.tsx` (4.2 KB) - Siri shortcuts интеграция

**Истории компоненти (`/stories/`):**

- `EnhancedStoryProgressBars.tsx` (3.9 KB) - Подобрени progress барове за
  истории
- `StoryContent.tsx` (4.1 KB) - Съдържание на история
- `StoryHeader.tsx` (2.8 KB) - Хедър на история
- `StoryProgressBars.tsx` (3.2 KB) - Progress барове за истории

**UI компоненти (`/ui/`):**

- `Button.tsx` (3.8 KB) - Основен бутон
- `Card.tsx` (2.9 KB) - Карта компонент
- `index.ts` (2.1 KB) - Експорти
- `Input.tsx` (4.1 KB) - Input поле
- `Text.tsx` (2.3 KB) - Text компонент

**Общи компоненти:**

- `AnimatedButton.tsx` (4.2 KB) - Анимиран бутон
- `EliteComponents.tsx` (5.1 KB) - Елитни компоненти
- `EnhancedSwipeCard.tsx` (6.8 KB) - Подобрена swipe карта
- `EnhancedTabBar.tsx` (3.9 KB) - Подобрена таб бар
- `ErrorBoundary.tsx` (3.1 KB) - Error boundary
- `ErrorFallback.tsx` (2.1 KB) - Error fallback
- `Footer.tsx` (2.8 KB) - Футър
- `OptimizedImage.tsx` (3.7 KB) - Оптимизирано изображение
- `PhotoUploadComponent.tsx` (4.9 KB) - Компонент за качване на снимки
- `PremiumSplashScreen.tsx` (3.8 KB) - Премиум splash екран
- `ShimmerPlaceholder.tsx` (2.7 KB) - Shimmer placeholder
- `SwipeCard.tsx` (7.1 KB) - Swipe карта
- `SwipeFilters.tsx` (3.7 KB) - Филтри за swipe
- `ThemeToggle.tsx` (2.5 KB) - Toggle за тема

#### `/screens/` - Екрани на приложението (79 елемента)

Екраните на мобилното приложение, организирани по функционалност.

**Административни екрани (`/admin/`):**

- Празна директория за административни екрани

**Екрани за осиновяване (`/adoption/`):**

- `AdoptionApplicationScreen.tsx` (6.1 KB) - Екран за кандидатстване за
  осиновяване
- `AdoptionContractScreen.tsx` (4.7 KB) - Екран за договори за осиновяване
- `AdoptionManagerScreen.tsx` (5.2 KB) - Мениджър на осиновявания
- `CreateListingScreen.tsx` (4.9 KB) - Създаване на обява за осиновяване

**AI екрани (`/ai/`):**

- `AICompatibilityScreen.tsx` (7.1 KB) - AI екран за съвместимост
- `AIPhotoAnalyzerScreen.tsx` (5.8 KB) - AI анализатор на снимки

**Екрани за разговори (`/calling/`):**

- `ActiveCallScreen.tsx` (8.9 KB) - Екран за активен разговор

**Екрани за лидерборд (`/leaderboard/`):**

- `LeaderboardScreen.tsx` (6.2 KB) - Екран с класация

**Екрани за onboarding (`/onboarding/`):**

- `PetProfileSetupScreen.tsx` (5.1 KB) - Настройка на профил на любимец
- `PreferencesSetupScreen.tsx` (4.8 KB) - Настройка на предпочитания
- `UserIntentScreen.tsx` (3.7 KB) - Екран за намерения на потребителя
- `WelcomeScreen.tsx` (4.1 KB) - Добре дошли екран

**Премиум екрани (`/premium/`):**

- `PremiumScreen.tsx` (7.2 KB) - Основен премиум екран
- `SubscriptionManagerScreen.tsx` (9.1 KB) - Мениджър на абонаменти
- `SubscriptionSuccessScreen.tsx` (4.7 KB) - Екран за успешно абонаментиране

**Основни екрани на приложението:**

- `AboutTermsPrivacyScreen.tsx` (3.9 KB) - Екран за about, terms и privacy
- `AdvancedFiltersScreen.tsx` (5.1 KB) - Разширени филтри
- `AIBioScreen.tsx` (6.2 KB) - AI биография екран
- `ARScentTrailsScreen.tsx` (4.8 KB) - AR миризливи пътеки
- `BlockedUsersScreen.tsx` (3.7 KB) - Блокирани потребители
- `ChatScreen.tsx` (8.7 KB) - Чат екран
- `ChatScreenNew.tsx` (7.9 KB) - Нов чат екран
- `DeactivateAccountScreen.tsx` (4.1 KB) - Деактивиране на акаунт
- `EditProfileScreen.tsx` (6.1 KB) - Редактиране на профил
- `ForgotPasswordScreen.tsx` (3.2 KB) - Забравена парола
- `HelpSupportScreen.tsx` (4.1 KB) - Помощ и поддръжка
- `HomeScreen.tsx` (7.8 KB) - Начална страница
- `ManageSubscriptionScreen.tsx` (5.2 KB) - Управление на абонамент
- `MapScreen.tsx` (6.7 KB) - Карта екран
- `MatchesScreen.tsx` (7.1 KB) - Мачове екран
- `PremiumCancelScreen.tsx` (3.8 KB) - Отказване на премиум
- `PremiumSuccessScreen.tsx` (4.2 KB) - Премиум успех
- `PrivacySettingsScreen.tsx` (4.7 KB) - Настройки за поверителност
- `ProfileScreen.tsx` (8.1 KB) - Профил екран
- `RegisterScreen.tsx` (5.9 KB) - Регистрация
- `ResetPasswordScreen.tsx` (3.1 KB) - Reset на парола
- `SafetyCenterScreen.tsx` (4.9 KB) - Център за безопасност
- `StoriesScreen.tsx` (5.7 KB) - Истории екран
- `StoriesScreenNew.tsx` (6.1 KB) - Нов истории екран
- `SwipeScreen.tsx` (7.2 KB) - Swipe екран

#### `/hooks/` - React хукове за мобилно приложение (35 елемента)

Специфични хукове за мобилната платформа с React Native интеграции.

**Анимационни хукове:**

- `useBounceAnimation.ts` (2.1 KB) - Bounce анимация
- `useCallPulseAnimation.ts` (2.9 KB) - Пулсираща анимация за разговори
- `useFadeInAnimation.ts` (1.9 KB) - Fade-in анимация
- `useFloatingAnimation.ts` (2.5 KB) - Плаваща анимация
- `useLiquidAnimation.ts` (2.8 KB) - Течна анимация
- `useMagneticAnimation.ts` (2.7 KB) - Магнитна анимация
- `useMemoryWeaveAnimation.ts` (3.2 KB) - Анимации за спомени
- `useMorphAnimation.ts` (2.9 KB) - Морфинг анимация
- `useMotionAnimation.ts` (2.3 KB) - Motion анимация
- `usePulseAnimation.ts` (2.1 KB) - Пулсираща анимация
- `useSequenceAnimation.ts` (3.1 KB) - Секвенционални анимации
- `useSlideInAnimation.ts` (2.1 KB) - Slide-in анимация
- `useSpringAnimation.ts` (2.7 KB) - Spring анимация
- `useToastAnimation.ts` (2.3 KB) - Toast анимации

**Бизнес логика хукове:**

- `useAccountOperations.ts` (3.2 KB) - Операции със сметката
- `useAdoptionContract.ts` (3.8 KB) - Договори за осиновяване
- `useARAnimation.ts` (2.8 KB) - AR анимации
- `useARHaptic.ts` (2.3 KB) - AR haptic feedback
- `useBiometric.ts` (2.5 KB) - Биометрична аутентификация
- `useDeepLink.ts` (3.1 KB) - Deep linking
- `useErrorHandler.ts` (2.9 KB) - Обработка на грешки
- `useErrorRecovery.ts` (2.7 KB) - Възстановяване от грешки
- `useFavorites.ts` (3.1 KB) - Любими профили
- `useFeedbackStates.ts` (2.3 KB) - Състояния на feedback
- `useMemories.ts` (3.7 KB) - Спомени
- `useNotifications.ts` (3.3 KB) - Push известия
- `useOffline.ts` (3.1 KB) - Офлайн функционалност
- `usePerformance.ts` (2.8 KB) - Мониторинг на производителност
- `usePhotoAnimation.ts` (2.5 KB) - Анимации на снимки
- `usePhotoUpload.ts` (3.7 KB) - Качване на снимки
- `usePremiumHapticFeedback.ts` (2.9 KB) - Премиум haptic feedback
- `useProfileData.ts` (3.1 KB) - Данни за профила
- `useRetry.ts` (2.1 KB) - Retry логика
- `useSettings.ts` (2.5 KB) - Настройки
- `useSocket.ts` (3.9 KB) - WebSocket връзка
- `useThemeToggle.ts` (2.1 KB) - Toggle на тема
- `useVideoCall.ts` (4.1 KB) - Видео разговори

**UI и взаимодействие хукове:**

- `useAccessibilityHooks.ts` (3.2 KB) - Достъпност хукове
- `useConfetti.ts` (1.9 KB) - Конфети ефект
- `useErrorDisplay.ts` (2.3 KB) - Показване на грешки
- `useFocusManagement.ts` (2.7 KB) - Управление на фокуса
- `useFocusTrap.ts` (2.3 KB) - Focus trap
- `useFormValidation.ts` (3.5 KB) - Валидация на форми
- `useHapticFeedback.ts` (3.1 KB) - Haptic feedback
- `useKeyboardShortcuts.ts` (3.9 KB) - Клавишни комбинации
- `useMediaQuery.ts` (2.1 KB) - Media queries
- `useParallaxScroll.ts` (2.3 KB) - Parallax скрол

**Swipe и мачове хукове:**

- `useSwipe.ts` (3.8 KB) - Swipe функционалност
- `useSwipeRateLimit.ts` (2.3 KB) - Ограничаване на swipe скорост

#### `/services/` - Услуги за мобилно приложение (47 елемента)

API клиенти и бизнес логика услуги за мобилната платформа.

**Чат услуги (`/chat/`):**

- `ChatAnimationManager.ts` (3.7 KB) - Мениджър на чат анимации
- `ChatSocketManager.ts` (4.8 KB) - Мениджър на чат сокети
- `ImageManager.ts` (3.1 KB) - Управление на изображения в чата
- `index.ts` (2.1 KB) - Експорти
- `MessageManager.ts` (4.2 KB) - Мениджър на съобщения
- `SafetyManager.ts` (2.7 KB) - Мениджър за безопасност на чата
- `TypingManager.ts` (2.5 KB) - Мениджър за индикатори на писане

**Истории услуги (`/stories/`):**

- `index.ts` (2.1 KB) - Експорти
- `useEnhancedStoryGestures.ts` (3.1 KB) - Подобрени жестове за истории
- `useStoryData.ts` (2.7 KB) - Данни за истории
- `useStoryGestures.ts` (2.3 KB) - Жестове за истории
- `useStoryNavigation.ts` (2.5 KB) - Навигация в истории
- `useStorySocket.ts` (2.8 KB) - Socket връзка за истории
- `useStoryTimer.ts` (1.9 KB) - Таймер за истории
- `useStoryViewerState.ts` (3.1 KB) - Състояние на viewer за истории

**WebRTC услуги (`/webrtc/`):**

- `CallStateManager.ts` (4.1 KB) - Мениджър на състоянията на разговори
- `index.ts` (2.1 KB) - Експорти
- `MediaManager.ts` (4.7 KB) - Мениджър на медия потоци
- `PeerConnectionManager.ts` (5.2 KB) - Мениджър на peer connections
- `QualityMonitor.ts` (3.3 KB) - Монитор на качеството
- `SignalingManager.ts` (4.1 KB) - Мениджър на сигнализация

**Основни услуги:**

- `AccessibilityService.ts` (3.2 KB) - Услуга за достъпност
- `adminAPI.ts` (5.7 KB) - Административен API
- `api.ts` (7.1 KB) - Основен API клиент
- `apiClient.ts` (4.9 KB) - API клиент
- `AssetPreloader.ts` (2.9 KB) - Предварително зареждане на ресурси
- `AuthService.ts` (4.1 KB) - Аутентификационна услуга
- `BiometricService.ts` (3.1 KB) - Биометрична услуга
- `errorHandler.ts` (4.2 KB) - Централизирана обработка на грешки
- `ImageCompressionService.ts` (3.7 KB) - Компресия на изображения
- `LeaderboardService.ts` (3.2 KB) - Услуга за класации
- `logger.ts` (2.9 KB) - Логър услуга
- `MatchingService.ts` (4.8 KB) - Услуга за мачове
- `notifications.ts` (3.7 KB) - Push известия
- `offlineService.ts` (4.1 KB) - Офлайн услуга
- `OfflineSyncService.ts` (5.1 KB) - Синхронизация при офлайн
- `PremiumService.ts` (3.9 KB) - Премиум услуга
- `pushNotificationService.ts` (3.3 KB) - Push notification услуга
- `SecureAPIService.ts` (3.8 KB) - Сигурна API услуга
- `usageTracking.ts` (4.1 KB) - Проследяване на използването
- `WebRTCService.ts` (11.2 KB) - WebRTC услуга
- `WebRTCServiceNew.ts` (12.1 KB) - Нова версия на WebRTC услугата

#### `/types/` - TypeScript типове за мобилно приложение (10 елемента)

Типове специфични за React Native и мобилната платформа.

**Основни типове:**

- `account.ts` (2.7 KB) - Типове за акаунти
- `expo-components.d.ts` (3.1 KB) - Expo компоненти типове
- `index.ts` (8.1 KB) - Основни експорти
- `memories.ts` (2.9 KB) - Типове за спомени
- `native-shims.d.ts` (1.8 KB) - Native shims типове
- `photo.ts` (2.3 KB) - Фото типове
- `premium-components.ts` (3.1 KB) - Премиум компоненти типове
- `premiumUi.ts` (2.8 KB) - Премиум UI типове
- `react-native-reanimated.d.ts` (4.1 KB) - Reanimated типове
- `stripe-react-native.d.ts` (2.9 KB) - Stripe типове

#### `/constants/` - Константи за мобилно приложение (7 елемента)

Константи специфични за мобилната платформа.

**Константи файлове:**

- `call.ts` (1.9 KB) - Константи за разговори
- `design-tokens.ts` (7.1 KB) - Design tokens
- `enhancedSwipeCard.ts` (1.7 KB) - Enhanced swipe card константи
- `haptics.ts` (2.1 KB) - Haptic константи
- `photo.ts` (1.6 KB) - Фото константи
- `premiumUi.ts` (2.7 KB) - Премиум UI константи
- `swipeCard.ts` (2.3 KB) - Swipe card константи

#### `/contexts/` - React контексти (3 елемента)

Контексти за мобилното приложение.

**Контекст файлове:**

- `NotificationContext.tsx` (3.7 KB) - Контекст за известия
- `ThemeContext.tsx` (4.1 KB) - Темов контекст

#### `/navigation/` - Навигация (2 елемента)

Навигационни настройки за React Navigation.

#### `/utils/` - Utility функции (5 елемента)

Помощни функции за мобилната платформа.

**Utility файлове:**

- `deepLinking.new.ts` (2.8 KB) - Нов deep linking
- `deepLinking.ts` (3.1 KB) - Deep linking
- `haptics.ts` (2.7 KB) - Haptic utilities
- `secureStorage.ts` (3.2 KB) - Сигурно съхранение

#### `/config/` - Конфигурация (1 елемент)

SSL сертификати конфигурация.

#### `/store/` - State management (1 елемент)

Filter store за мобилното приложение.

#### `/styles/` - Стилове (2 елемента)

Dark тема стилове.

#### `/theme.ts` - Тема

Основна тема конфигурация (12.5 KB)

#### `/setupTests.js` - Test setup

Настройка за тестове (5.4 KB)

# ДОКУМЕНТАЦИЯ НА ФАЙЛОВЕТЕ В ПРОЕКТА PAWFECMATCH

## ЧАСТ 3: СЪРВЪР/БАКЕНД (server/src/)

### ГЛАВНА СТРУКТУРА НА ДИРЕКТОРИИТЕ

#### `/controllers/` - Контролери (27 елемента)

API контролери, които обработват бизнес логиката и HTTP заявките.

**Административни контролери:**

- `adminAnalyticsController.js` (4.1 KB) - Аналитични данни за администраторите
- `adminController.js` (8.7 KB) - Основен административен контролер
- `adminController.optimized.js` (9.2 KB) - Оптимизирана версия на
  административния контролер
- `adminEnhancedFeaturesController.js` (5.8 KB) - Подобрени административни
  функции
- `adminModerationController.js` (6.1 KB) - Модерация от администратори
- `aiModerationController.js` (4.7 KB) - AI-базирана модерация

**Аутентификационни контролери:**

- `authController.js` (7.2 KB) - Управление на аутентификацията
- `biometricController.js` (3.8 KB) - Биометрична аутентификация

**Чат и комуникация:**

- `chatController.js` (6.9 KB) - Чат функционалност
- `conversationController.js` (5.1 KB) - Управление на разговори

**Основни бизнес контролери:**

- `accountController.js` (5.7 KB) - Управление на потребителски сметки
- `analyticsController.js` (4.8 KB) - Аналитични данни
- `favoritesController.js` (3.9 KB) - Любими профили
- `leaderboardController.js` (3.2 KB) - Класации
- `matchController.js` (5.1 KB) - Мачове между потребители
- `memoriesController.js` (4.7 KB) - Спомени и история
- `moderationAnalyticsController.js` (3.1 KB) - Аналитика за модерацията
- `moderationController.js` (7.8 KB) - Модерация на съдържание
- `notificationController.js` (4.9 KB) - Push известия
- `petController.js` (6.1 KB) - Управление на профили на любимци
- `premiumController.js` (5.2 KB) - Премиум функции
- `sessionController.js` (3.7 KB) - Управление на сесии
- `storiesController.js` (4.1 KB) - Истории
- `userController.js` (8.1 KB) - Управление на потребители
- `webhookController.js` (4.3 KB) - Webhook обработка за Stripe

**Специфични контролери:**

- `personalityController.js` (3.9 KB) - Анализ на личността

#### `/routes/` - API маршрути (30 елемента)

Дефиниции на API endpoints и маршрутите.

**Основни маршрути:**

- `account.js` (4.2 KB) - Маршрути за управление на сметки
- `admin.js` (7.1 KB) - Административни маршрути
- `admin.routes.addition.js` (2.9 KB) - Допълнителни административни маршрути
- `adminEnhancedFeatures.js` (3.7 KB) - Подобрени административни функции
- `adminModeration.js` (4.1 KB) - Модерационни маршрути
- `ai.js` (3.9 KB) - AI маршрути
- `aiModeration.js` (2.8 KB) - AI модерация
- `aiModerationAdmin.js` (2.1 KB) - AI модерация за администратори
- `analytics.js` (3.2 KB) - Аналитични маршрути
- `auth.js` (5.1 KB) - Аутентификационни маршрути
- `biometric.js` (2.7 KB) - Биометрични маршрути
- `chat.js` (4.8 KB) - Чат маршрути
- `community.js` (3.1 KB) - Комунитетни маршрути
- `conversations.js` (3.9 KB) - Маршрути за разговори
- `dashboard.js` (2.9 KB) - Dashboard маршрути
- `events.js` (2.3 KB) - Събития маршрути
- `favorites.js` (2.8 KB) - Любими маршрути
- `health.js` (1.8 KB) - Health check маршрути
- `leaderboard.js` (2.1 KB) - Класации маршрути
- `map.js` (2.9 KB) - Карта маршрути
- `matches.js` (3.7 KB) - Мачове маршрути
- `memories.js` (3.1 KB) - Спомени маршрути
- `moderation.js` (4.9 KB) - Модерация маршрути
- `moderationAdmin.js` (2.7 KB) - Модерация за администратори
- `notifications.js` (3.3 KB) - Известия маршрути
- `personality.js` (2.5 KB) - Личност маршрути
- `pets.js` (4.7 KB) - Любимци маршрути
- `premium.js` (3.8 KB) - Премиум маршрути
- `usageTracking.js` (2.1 KB) - Проследяване на използването
- `users.js` (5.2 KB) - Потребители маршрути
- `webhooks.js` (2.9 KB) - Webhook маршрути

#### `/models/` - Модели на данни (25 елемента)

MongoDB/Mongoose модели за структурата на данните.

**Основни модели:**

- Модели за потребители и акаунти
- Модели за любимци и профили
- Модели за мачове и взаимодействия
- Модели за чат и съобщения
- Модели за модерация
- Модели за премиум функции
- Модели за аналитика

#### `/services/` - Бизнес услуги (17 елемента)

Изолирана бизнес логика и външни интеграции.

**Основни услуги:**

- `adminNotifications.js` (3.7 KB) - Административни известия
- `adminNotificationService.js` (3.1 KB) - Услуга за административни известия
- `adminWebSocket.js` (4.2 KB) - WebSocket за администратори
- `aiService.js` (5.1 KB) - AI услуги
- `analyticsService.js` (6.2 KB) - Аналитични услуги
- `automatedModeration.js` (4.8 KB) - Автоматизирана модерация
- `chatService.js` (6.7 KB) - Чат услуги
- `chatSocket.js` (4.9 KB) - Чат WebSocket
- `cloudinaryService.js` (2.8 KB) - Cloudinary интеграция
- `emailService.js` (3.9 KB) - Имейл услуги
- `emailTemplates.js` (4.1 KB) - Имейл шаблони
- `monitoring.js` (4.2 KB) - Мониторинг
- `paymentRetryService.js` (3.1 KB) - Повторни опити за плащания
- `stripeService.js` (5.8 KB) - Stripe интеграция
- `subscriptionAnalyticsService.js` (3.9 KB) - Аналитика за абонаменти
- `usageTrackingService.js` (4.2 KB) - Проследяване на използването

#### `/middleware/` - Middleware функции (17 елемента)

Express middleware за обработка на заявки, сигурност и валидация.

**Сигурност и аутентификация:**

- `adminAuth.js` (3.1 KB) - Административна аутентификация
- `auth.js` (4.7 KB) - Основна аутентификация
- `csrf.js` (2.9 KB) - CSRF защита
- `rbac.js` (4.1 KB) - Role-based access control
- `sessionManager.js` (3.8 KB) - Управление на сесии

**Валидация и ограничения:**

- `errorHandler.js` (4.2 KB) - Централизирана обработка на грешки
- `globalRateLimit.js` (2.1 KB) - Глобално rate limiting
- `inputValidator.js` (3.7 KB) - Валидация на входни данни
- `premiumGating.js` (2.8 KB) - Премиум gate
- `rateLimiter.js` (3.1 KB) - Rate limiting
- `requestId.js` (1.9 KB) - Request ID middleware
- `storyDailyLimiter.js` (2.3 KB) - Ограничение за истории на ден
- `validation.js` (4.1 KB) - Обща валидация
- `validator.js` (5.2 KB) - Валидатор
- `zodValidator.js` (3.1 KB) - Zod валидация

**Логинг:**

- `adminLogger.js` (2.7 KB) - Административен логинг

#### `/sockets/` - WebSocket обработка (4 елемента)

Real-time комуникация чрез WebSocket.

**Socket файлове:**

- Основни socket handlers за чат, известия и real-time функции

#### `/config/` - Конфигурация (2 елемента)

Конфигурационни настройки за приложението.

#### `/migrations/` - Миграции на база данни (2 елемента)

Скриптове за обновяване на схемата на базата данни.

#### `/schemas/` - Схеми за валидация (1 елемент)

Zod схеми за валидация на данни.

#### `/utils/` - Помощни функции (5 елемента)

Общи utility функции за сървър