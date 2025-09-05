import { supabase } from '../../../lib/supabaseClient'
import { Metadata } from 'next'
import RedirectClient from './RedirectClient'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const { data } = await supabase
    .from('reviews')
    .select('title, publisher, author, genre')
    .eq('id', id)
    .single()

  if (!data) {
    return {
      title: '서평단',
      description: '서평단 신청'
    }
  }

  const title = `📖 『${data.title}』 서평단 모집`

  return {
    title,
    openGraph: {
      title,
      type: 'website'
    },
    twitter: {
      card: 'summary',
      title
    }
  }
}

export default async function RedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <RedirectClient id={id} />
}