'use client'

import React from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react' // 推薦安裝 lucide-react

interface UniversalErrorProps {
  title?: string
  message?: string
  error?: Error | string
  onRetry?: () => void
  fullScreen?: boolean
}

const UniversalError: React.FC<UniversalErrorProps> = ({
  title = '出錯了！',
  message = '我們在載入頁面時遇到了點問題。',
  error,
  onRetry,
  fullScreen = false,
}) => {
  // 提取錯誤字串
  const errorMessage = error instanceof Error ? error.message : error

  return (
    <div
      className={`flex flex-col items-center justify-center p-6 text-center ${
        fullScreen
          ? 'fixed inset-0 bg-white z-50'
          : 'w-full h-full min-h-75 bg-gray-50/50  border-gray-300'
      }`}
    >
      {/* 圖示 */}
      {/* <div className="mb-4 p-3 bg-red-100 rounded-full text-red-600">
        <AlertCircle size={40} />
      </div> */}

      {/* 文字內容 */}
      <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 max-w-md mb-4">{message}</p>

      {/* 詳細錯誤訊息 (開發環境或偵錯時很有用) */}
      {errorMessage && (
        <code className="mb-6 px-3 py-1 bg-gray-100 text-red-500 text-xs rounded border border-gray-200 break-all max-w-xs md:max-w-md">
          {errorMessage}
        </code>
      )}

      {/* 按鈕操作區 */}
      <div className="flex gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm"
          >
            <RefreshCw size={18} />
            再試一次
          </button>
        )}

        {fullScreen && (
          <button
            onClick={() => (window.location.href = '/')}
            className="flex items-center gap-2 px-6 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors font-medium shadow-sm"
          >
            <Home size={18} />
            回首頁
          </button>
        )}
      </div>
    </div>
  )
}

export default UniversalError
