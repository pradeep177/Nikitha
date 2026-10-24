import { Link, useLocation } from 'react-router'
import { Compass } from 'lucide-react'
import EmptyState from '@/components/EmptyState'
import PhotoBackdrop from '@/components/PhotoBackdrop'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function NotFoundPage() {
  usePageTitle('Lost in space')
  const inAdmin = useLocation().pathname.startsWith('/admin')
  return (
    <div className="px-5 pt-16">
      {!inAdmin && <PhotoBackdrop start={4} />}
      <EmptyState
        icon={Compass}
        headingLevel={1}
        title="Lost among the stars"
        message="This little corner of our universe doesn't exist (yet). But hey — you found someone worth finding ♡"
        action={
          <Link to="/" className="btn btn-primary">
            Take me home ♡
          </Link>
        }
      />
    </div>
  )
}
