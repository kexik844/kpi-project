import React, { useState } from 'react';
import { X, Smartphone, Apple, Terminal, Share2, PlusSquare, CheckCircle2, Copy, Check } from 'lucide-react';

interface ReactNativeInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReactNativeInfoModal: React.FC<ReactNativeInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'pwa' | 'capacitor' | 'rn'>('pwa');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const capacitorCommands = `# 1. Установите Capacitor в проект
npm install @capacitor/core @capacitor/cli @capacitor/ios

# 2. Инициализируйте мобильный проект
npx cap init "Личный KPI" "com.personal.kpitracker"

# 3. Соберите веб-версию
npm run build

# 4. Добавьте платформу iOS
npx cap add ios

# 5. Откройте проект в Xcode на macOS
npx cap open ios`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/45 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="mobile-info-modal"
        className="bg-white rounded-3xl max-w-xl w-full p-4.5 sm:p-6 shadow-2xl border border-stone-100 my-auto max-h-[92dvh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-[#ffe4e8] border border-[#ffd4dc] flex items-center justify-center text-[#be185d]">
            <Apple className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900">
              Установка на iOS (iPhone & iPad)
            </h2>
            <span className="text-xs text-[#9f1239] font-medium">
              3 способа запуска на мобильных устройствах
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 p-1 bg-stone-100 rounded-2xl mb-3 text-xs font-semibold shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex-1 min-h-[38px] py-1.5 px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-[11px] sm:text-xs whitespace-nowrap ${
              activeTab === 'pwa'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-[#fb7185] shrink-0" />
            <span>1. PWA</span>
          </button>
          <button
            onClick={() => setActiveTab('capacitor')}
            className={`flex-1 min-h-[38px] py-1.5 px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-[11px] sm:text-xs whitespace-nowrap ${
              activeTab === 'capacitor'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-[#61c0bf] shrink-0" />
            <span>2. Capacitor</span>
          </button>
          <button
            onClick={() => setActiveTab('rn')}
            className={`flex-1 min-h-[38px] py-1.5 px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-[11px] sm:text-xs whitespace-nowrap ${
              activeTab === 'rn'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Apple className="w-3.5 h-3.5 text-[#2b7a78] shrink-0" />
            <span>3. React Native</span>
          </button>
        </div>

        <div className="overflow-y-auto pr-1 flex-1 space-y-3">

        {/* Tab 1: PWA (Easiest, 30 seconds) */}
        {activeTab === 'pwa' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#fff0f3] to-white border border-[#ffd4dc]">
              <div className="text-xs font-bold text-[#881337] flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-4 h-4 text-[#fb7185]" />
                Самый быстрый и удобный способ (занимает 30 секунд)
              </div>
              <p className="text-xs text-[#9f1239]/90 leading-relaxed">
                Приложение уже настроено как Progressive Web App. Его можно установить на рабочий стол iPhone прямо из браузера Safari без аккаунта разработчика Apple и без Xcode.
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-stone-700">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200/70">
                <div className="w-6 h-6 rounded-full bg-[#61c0bf] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <div className="font-bold text-stone-900">Откройте ссылку в Safari на iPhone</div>
                  <div className="text-stone-500 mt-0.5">
                    Откройте постоянный адрес вашего приложения (опубликованный URL или собственный домен) именно в <strong>Safari</strong> (браузер Apple).
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200/70">
                <div className="w-6 h-6 rounded-full bg-[#61c0bf] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <div className="font-bold text-stone-900 flex items-center gap-1.5">
                    Нажмите кнопку «Поделиться»
                    <Share2 className="w-3.5 h-3.5 text-[#61c0bf]" />
                  </div>
                  <div className="text-stone-500 mt-0.5">
                    Внизу экрана Safari нажмите квадрат со стрелочкой вверх (кнопка меню «Поделиться»).
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200/70">
                <div className="w-6 h-6 rounded-full bg-[#61c0bf] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <div className="font-bold text-stone-900 flex items-center gap-1.5">
                    Выберите «На экран "Домой"»
                    <PlusSquare className="w-3.5 h-3.5 text-[#fb7185]" />
                  </div>
                  <div className="text-stone-500 mt-0.5">
                    Прокрутите список вниз и нажмите пункт <strong>«На экран "Домой"» (Add to Home Screen)</strong>, затем нажмите «Добавить» в правом верхнем углу.
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#bbded6]/25 border border-[#bbded6] text-xs text-[#246158]">
              <strong>Результат:</strong> на экране вашего iPhone появится фирменная иконка «Личный KPI». Приложение будет запускаться в полноэкранном режиме (без рамок браузера Safari), хранить данные в телефоне и работать офлайн.
            </div>
          </div>
        )}

        {/* Tab 2: Capacitor (Native iOS App via Xcode) */}
        {activeTab === 'capacitor' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <p className="text-xs text-stone-600 leading-relaxed">
              Если вам нужен <strong>настоящий .ipa файл</strong> для установки через TestFlight или публикации в <strong>App Store</strong>, воспользуйтесь Capacitor. Он упаковывает готовый проект в полноценный iOS-проект для Xcode за 2 минуты:
            </p>

            <div className="relative">
              <pre className="bg-stone-900 text-stone-100 p-3.5 rounded-2xl text-[11px] font-mono overflow-x-auto leading-relaxed">
                {capacitorCommands}
              </pre>
              <button
                onClick={() => copyToClipboard(capacitorCommands, 'cap')}
                className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copiedCode === 'cap' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Скопировано</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Скопировать</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-xs text-stone-600 space-y-1">
              <div className="font-semibold text-stone-800">Что произойдёт дальше:</div>
              <ul className="list-disc list-inside space-y-1 text-stone-500 pl-1">
                <li>Откроется Xcode с готовым iOS приложением.</li>
                <li>Подключите iPhone проводом или выберите симулятор iPhone.</li>
                <li>В Xcode в разделе <em>Signing & Capabilities</em> выберите свой Apple ID (Personal Team).</li>
                <li>Нажмите кнопку <strong>Run (▶)</strong> — приложение установится на ваш iPhone!</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 3: React Native / Expo */}
        {activeTab === 'rn' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <p className="text-xs text-stone-600 leading-relaxed">
              Если вы хотите переписать рендеринг на нативные компоненты React Native (View, Text, FlatList) с фреймворком <strong>Expo</strong>:
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="font-bold text-stone-800">1. Бизнес-логика готова на 100%</div>
                <div className="text-stone-500 mt-0.5">
                  Модели <code>types.ts</code> и весь калькулятор <code>kpiCalculator.ts</code> работают в React Native без каких-либо изменений.
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="font-bold text-stone-800">2. Хранилище</div>
                <div className="text-stone-500 mt-0.5">
                  В <code>storageService.ts</code> вызовы <code>localStorage</code> заменяются на <code>@react-native-async-storage/async-storage</code>.
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="font-bold text-stone-800">3. Быстрый старт Expo</div>
                <div className="text-stone-500 mt-0.5">
                  Выполните <code>npx create-expo-app MyKPIApp</code> и установите приложение на iPhone через бесплатное приложение <strong>Expo Go</strong> из App Store.
                </div>
              </div>
            </div>
          </div>
        )}

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-stone-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="min-h-[42px] px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#61c0bf] hover:bg-[#4db2b1] active:bg-[#3ca1a0] transition-colors cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
