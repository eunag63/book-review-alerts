// app/page.tsx
import { generateDynamicMetadata, defaultMetadata } from '../lib/metadata'
import HomePage from './HomePage'

// 동적 메타데이터 생성
export async function generateMetadata() {
  try {
    return await generateDynamicMetadata()
  } catch (error) {
    console.error('메타데이터 생성 실패:', error)
    return defaultMetadata
  }
}

// 메인 페이지 컴포넌트
export default function Page() {
  return <HomePage />
}