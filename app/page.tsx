import { redirect } from 'next/navigation'

// Root page — redirect ke /login
// Middleware akan redirect ke /home atau /teacher/dashboard jika sudah login
export default function RootPage() {
  redirect('/login')
}
