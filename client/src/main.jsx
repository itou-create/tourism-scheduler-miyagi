import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Reactアプリをマウント
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Reactがマウントされた後、初期ローディング画面を非表示にする
setTimeout(() => {
  const loader = document.getElementById('initial-loader')
  if (loader) {
    loader.classList.add('hidden')
    // フェードアウトアニメーション完了後にDOMから削除
    setTimeout(() => {
      loader.remove()
    }, 500) // transition時間と合わせる
  }
}, 300) // Reactのレンダリングを待つための短い遅延
