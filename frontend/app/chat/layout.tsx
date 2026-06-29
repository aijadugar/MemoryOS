import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chat | MemoryOS',
  description: 'Chat with your memory-enhanced AI assistant',
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
