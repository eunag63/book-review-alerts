'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: number
  kakao_id: number
  email?: string
  nickname?: string
  profile_image?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (userData: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 페이지 로드 시 로그인 상태 확인
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('저장된 사용자 정보 파싱 오류:', error)
        localStorage.removeItem('user')
      }
    }
    
    // URL 파라미터에서 로그인 성공 정보 확인
    const urlParams = new URLSearchParams(window.location.search)
    const loginSuccess = urlParams.get('login_success')
    const userId = urlParams.get('user_id')
    const nickname = urlParams.get('nickname')
    
    if (loginSuccess === 'true' && userId) {
      // 카카오 로그인 성공 후 리다이렉트된 경우
      const userData: User = {
        id: parseInt(userId),
        kakao_id: 0, // 임시값
        nickname: nickname || ''
      }
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      
      // URL 파라미터 정리
      window.history.replaceState({}, '', window.location.pathname)
    }
    
    setIsLoading(false)
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    
    // 카카오 로그아웃
    if (typeof window !== 'undefined' && window.Kakao) {
      window.Kakao.Auth.logout(() => {
        console.log('카카오 로그아웃 완료')
      })
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}