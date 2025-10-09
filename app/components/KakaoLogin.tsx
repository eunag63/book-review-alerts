'use client'

import { useEffect, useState } from 'react'

interface KakaoAuth {
  login: (options: { success: (authObj: { access_token: string }) => void; fail: (error: Error) => void }) => void
  logout: (callback: () => void) => void
}

interface KakaoAPI {
  request: (options: { url: string; success: (userInfo: KakaoUserInfo) => void; fail: (error: Error) => void }) => void
}

interface KakaoUserInfo {
  id: number
  kakao_account?: {
    email?: string
  }
  properties?: {
    nickname?: string
    profile_image?: string
  }
}

interface KakaoSDK {
  init: (key: string) => void
  isInitialized: () => boolean
  Auth: KakaoAuth
  API: KakaoAPI
}

declare global {
  interface Window {
    Kakao: KakaoSDK
  }
}

interface UserInfo {
  id: number
  email?: string
  nickname?: string
  profile_image?: string
  access_token: string
}

interface KakaoLoginProps {
  onLoginSuccess?: (userInfo: UserInfo) => void
  onLoginError?: (error: Error) => void
}

export default function KakaoLogin({ onLoginSuccess, onLoginError }: KakaoLoginProps) {
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false)

  useEffect(() => {
    // 카카오 SDK 로드
    if (typeof window !== 'undefined' && !window.Kakao) {
      const script = document.createElement('script')
      script.src = 'https://developers.kakao.com/sdk/js/kakao.js'
      script.async = true
      script.onload = () => {
        if (window.Kakao && !window.Kakao.isInitialized()) {
          const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY
          if (kakaoKey) {
            window.Kakao.init(kakaoKey)
            setIsKakaoLoaded(true)
          }
        }
      }
      document.head.appendChild(script)
    } else if (window.Kakao) {
      if (!window.Kakao.isInitialized()) {
        const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY
        if (kakaoKey) {
          window.Kakao.init(kakaoKey)
        }
      }
      setIsKakaoLoaded(true)
    }
  }, [])

  const handleKakaoLogin = () => {
    if (!isKakaoLoaded || !window.Kakao) {
      console.error('카카오 SDK가 로드되지 않았습니다.')
      return
    }

    window.Kakao.Auth.login({
      success: (authObj: { access_token: string }) => {
        console.log('카카오 로그인 성공:', authObj)
        // 사용자 정보 요청
        window.Kakao.API.request({
          url: '/v2/user/me',
          success: async (userInfo: KakaoUserInfo) => {
            console.log('사용자 정보:', userInfo)
            
            try {
              // 우리 서버에 사용자 정보 저장
              const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  kakao_id: userInfo.id,
                  email: userInfo.kakao_account?.email,
                  nickname: userInfo.properties?.nickname,
                  profile_image: userInfo.properties?.profile_image
                })
              })

              const result = await response.json()

              if (result.success) {
                console.log('서버 로그인 성공:', result.user)
                if (onLoginSuccess) {
                  onLoginSuccess({
                    id: result.user.id,
                    email: result.user.email,
                    nickname: result.user.nickname,
                    profile_image: result.user.profile_image,
                    access_token: authObj.access_token
                  })
                }
              } else {
                console.error('서버 로그인 실패:', result.error)
                if (onLoginError) onLoginError(new Error(result.error))
              }

            } catch (error) {
              console.error('서버 로그인 요청 실패:', error)
              if (onLoginError) onLoginError(error as Error)
            }
          },
          fail: (error: Error) => {
            console.error('사용자 정보 요청 실패:', error)
            if (onLoginError) onLoginError(error)
          }
        })
      },
      fail: (error: Error) => {
        console.error('카카오 로그인 실패:', error)
        if (onLoginError) onLoginError(error)
      }
    })
  }


  if (!isKakaoLoaded) {
    return (
      <button disabled className="bg-gray-300 text-gray-500 px-4 py-2 rounded">
        카카오 로딩 중...
      </button>
    )
  }

  return (
    <button
      onClick={handleKakaoLogin}
      className="text-white text-sm hover:text-gray-300 transition-colors"
    >
      로그인
    </button>
  )
}